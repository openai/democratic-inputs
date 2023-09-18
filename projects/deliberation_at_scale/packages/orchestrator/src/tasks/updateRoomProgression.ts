import { Helpers, Job } from "graphile-worker";
import { isObject, min } from "radash";
import dayjs from "dayjs";

import { progressionTopology } from "../config/toplogy";
import { supabaseClient, Moderation } from "../lib/supabase";
import { waitForAllModerationCompletions } from "../lib/graphileWorker";
import { BaseProgressionWorkerTaskPayload, ProgressionTask, RoomStatus } from "../types";
import { Database } from "../generated/database-public.types";
import { VerificationFunctionCompletionResult } from "../lib/openai";
import { ENABLE_ROOM_PROGRESSION } from "../config/constants";
import { getRoomById, updateRoomStatus, getCompletedModerationsByJobKey, getLastCompletedModerationByJobKey, getMessagesAfter } from "../utilities/moderatorTasks";

export interface UpdateRoomProgressionPayload {
    roomId: string;
}

/**
 * This task determines whether a single room can progress to a new phase in the deliberation.
 * A configurable topology of a succesful deliberation is used as a reference to determine all the steps.
 */
export default async function updateRoomProgression(payload: UpdateRoomProgressionPayload, helpers: Helpers) {
    const { roomId } = payload;
    const room = await getRoomById(roomId);

    // guard: check if the room is valid
    if (!roomId || !room) {
        throw Error(`Could not update progression because the room was not found. Room ID: ${roomId}`);
    }

    const currentRoomStatus: RoomStatus = room?.status_type ?? 'safe';
    const currentTopologyLayerIndex = progressionTopology.layers.findIndex((topologyLayer) => {
        return topologyLayer.roomStatus === currentRoomStatus;
    }) ?? 0;
    const currentTopologyLayer = progressionTopology?.layers?.[currentTopologyLayerIndex];

    // guard: make sure the layer is valid
    if (!currentTopologyLayer) {
        throw Error(`Could not update progression topology layer could not be found. Room ID: ${roomId}, room status: ${currentRoomStatus}.`);
    }

    const currentTopologyLayerId = currentTopologyLayer.id;

    helpers.logger.info(`Running update progression task for room ${roomId} in progression layer ${currentTopologyLayerId}.`);

    const currentLayerVerifications = currentTopologyLayer?.verifications ?? [];
    const activeVerifications = currentLayerVerifications.filter((verification) => verification.active ?? true);
    const fallbackVerifications = progressionTopology.layers.slice(0, currentTopologyLayerIndex).flatMap((topologyLayer) => {
        const verifications = topologyLayer?.verifications ?? [];
        return verifications.filter((verification) => {
            const { active = true, fallback = false } = verification;

            return active && fallback;
        });
    });

    helpers.logger.info(`Running ${activeVerifications.length} active verifications and ${fallbackVerifications.length} fallback verifications for room ${roomId} in progression layer ${currentTopologyLayerId}.`);

    const [currentLayerVerificationsResult, fallbackVerificationResults] = await Promise.allSettled([
        waitForAllProgressionTasks({
            progressionTasks: activeVerifications,
            roomId,
            helpers,
        }),
        waitForAllProgressionTasks({
            progressionTasks: fallbackVerifications,
            roomId,
            helpers,
        }),
    ]);

    if (currentLayerVerificationsResult.status === 'rejected') {
        throw Error(`Could not update progression, because the current layer verifications failed. Room ID: ${roomId}, Reason: ${currentLayerVerificationsResult.reason}`);
    }

    if (fallbackVerificationResults.status === 'rejected') {
        throw Error(`Could not update progression, because the fallback layer verifications failed. Room ID: ${roomId}, Reason: ${fallbackVerificationResults.reason}`);
    }

    const { failedProgressionTaskIds: currentFailedProgressionTaskIds } = currentLayerVerificationsResult.value;
    const { failedProgressionTaskIds: fallbackFailedProgressionTaskIds } = fallbackVerificationResults.value;
    const failedVerificationTaskIds = [...currentFailedProgressionTaskIds, ...fallbackFailedProgressionTaskIds];
    const hasFailedVerifications = failedVerificationTaskIds.length > 0;
    const hasFailedFallbackVerifications = fallbackFailedProgressionTaskIds.length > 0;

    // guard: if one verification has failed we cannot proceed to the next progression
    if (hasFailedVerifications) {
        helpers.logger.info(`Not all progression verifications passed for room ${roomId}: ${JSON.stringify(failedVerificationTaskIds)}.`);

        // guard: check if we need to fallback the room status
        if (hasFailedFallbackVerifications) {

            // find the minimum index of all the failed fallback verifications
            // because we want to fallback to the lowest possible layer where an verification failed
            const minimumFallbackLayerIndex = min(fallbackFailedProgressionTaskIds.map((failedProgressionTaskId) => {
                const index = progressionTopology.layers.findIndex((topologyLayer) => {
                    const verifications = topologyLayer?.verifications ?? [];
                    return verifications.some((verification) => {
                        return verification.id === failedProgressionTaskId;
                    });
                });

                // guard: skip when the index is not found
                if (index < 0) {
                    return currentTopologyLayerIndex;
                }

                return index;
            })) ?? 0;
            const fallbackLayer = progressionTopology.layers[minimumFallbackLayerIndex];
            const fallbackRoomStatus = fallbackLayer.roomStatus;

            // guard: skip when the fallback status is the same as the current status
            if (currentRoomStatus === fallbackRoomStatus) {
                helpers.logger.info(`The room status is already on the fallback status ${fallbackRoomStatus} for room ${roomId}.`);
                return;
            }

            helpers.logger.info(`Falling back to room status ${fallbackRoomStatus} for room ${roomId} because of failed verifications: ${JSON.stringify(fallbackFailedProgressionTaskIds)}.`);

            // progress to the new status
            updateRoomStatus({
                roomId,
                roomStatus: fallbackRoomStatus,
                helpers,
            });

            // do not proceed with any additional enrichments
            return;
        }

        // trigger all enrichments on no progression to the next layer
        // NOTE: this can be done asynchronously
        const currentLayerEnrichments = currentTopologyLayer.enrichments ?? [];
        addProgressionTaskJobs({
            progressionTasks: currentLayerEnrichments,
            roomId,
            helpers,
        });
        return;
    }

    helpers.logger.info(`All verifications passed for ${roomId} in progression layer ${currentTopologyLayerId}!`);

    const nextProgressionLayer = progressionTopology.layers?.[currentTopologyLayerIndex + 1];

    // guard: check if there is a next layer
    if (!nextProgressionLayer) {
        return;
    }

    helpers.logger.info(`The next progression layer is ${nextProgressionLayer?.id} for room ${roomId}.`);

    // progress to the new status
    // NOTE: this can be done asynchronously
    if (ENABLE_ROOM_PROGRESSION) {
        updateRoomStatus({
            roomId,
            roomStatus: nextProgressionLayer.roomStatus,
            helpers,
        });
    }

}

interface WaitForAllProgressionTasksOptions {
    progressionTasks: ProgressionTask[];
    roomId: string;
    helpers: Helpers;
}

/**
 * Helper to wait for all progressions tasks to complete and return the failed progression task IDs.
 * This makes it easy to check which verifications did not pass.
 */
async function waitForAllProgressionTasks(options: WaitForAllProgressionTasksOptions) {
    const { helpers } = options;
    const settledJobs = await addProgressionTaskJobs(options);
    const jobs = settledJobs.map((job) => {
        if (job.status !== 'fulfilled') {
            return;
        }

        return job.value;
    }).filter((job): job is Job => {
        return !!job;
    });

    const completedModerationTuples = await waitForAllModerationCompletions({
        jobs,
    });
    const failedModerationTuples = completedModerationTuples.filter((completedModerationTuple) => {

        if (completedModerationTuple.status === 'rejected') {
            return true;
        }

        const { moderation } = completedModerationTuple.value;
        const isFailed = isFailedModeration(moderation);

        return isFailed;
    });
    const failedProgressionTaskIds = failedModerationTuples.map((failedModerationTuple) => {

        if (failedModerationTuple.status === 'rejected') {
            helpers.logger.error(`A job failed to complete for the following reason: ${JSON.stringify(failedModerationTuple.reason)}`);
            return 'unknown';
        }

        const { job: failedJob } = failedModerationTuple.value;
        const failedJobPayload = failedJob?.payload as BaseProgressionWorkerTaskPayload;
        const progressionTaskId = failedJobPayload?.progressionTask?.id ?? 'unknown';

        return progressionTaskId;
    });

    return {
        completedModerationTuples,
        failedProgressionTaskIds,
    };
}

function isFailedModeration(moderation: Moderation) {
    const result = moderation?.result as unknown as VerificationFunctionCompletionResult;

    if (!isObject(result)) {
        return true;
    }

    const hasResult = result ?? false;
    const isVerified = result?.verified ?? true;

    return !hasResult || !isVerified;
}

interface ProgressionTasksContextOptions {
    progressionTasks: ProgressionTask[];
    roomId: string;
    helpers: Helpers;
}

/**
 * Helper to add all progression tasks as jobs to the job system. Along with this it also adds a moderation to the database.
 * This allows us to track which progression tasks are triggered in the past to filter them for cooldowns and maximum attempts.
 */
async function addProgressionTaskJobs(options: ProgressionTasksContextOptions) {
    const { roomId, helpers } = options;
    const { hasErroredProgressionTasks, validProgressionTasks, erroredProgressionTasks } = await filterProgressionTasks(options);

    if (hasErroredProgressionTasks) {
        throw Error(`Could not add progression task jobs for room ${roomId} because one of the verifications failed before executing the jobs. Failed verifications: ${JSON.stringify(erroredProgressionTasks)}`);
    }

    // run in parallel to optimize speed of these tasks
    const [jobsResult, moderationsInsertResult] = await Promise.allSettled([
        Promise.allSettled(validProgressionTasks.map((progressionTask) => {
            const { id: progressionTaskId, workerTaskId } = progressionTask;
            const jobKey = generateProgressionJobKey(roomId, progressionTaskId);

            helpers.logger.info(`Adding worker task ${workerTaskId} via progression task with job key: ${jobKey}`);

            return helpers.addJob(workerTaskId, {
                progressionTask,
                jobKey,
                roomId,
            } satisfies BaseProgressionWorkerTaskPayload, {
                jobKey,
                jobKeyMode: 'preserve_run_at',
            });
        })),

        supabaseClient.from("moderations").insert(validProgressionTasks.map((progressionTask) => {
            const { id: progressionTaskId, workerTaskId } = progressionTask;
            const jobKey = generateProgressionJobKey(roomId, progressionTaskId);

            return {
                type: progressionTaskId,
                job_key: jobKey,
                statement: `A room received a progression task with worker task ID: ${workerTaskId}.`,
                target_type: 'room',
                room_id: roomId,
            } satisfies Database['public']['Tables']['moderations']['Insert'];
        })),
    ]);

    // guard: check if the results are valid
    if (jobsResult.status === 'rejected') {
        helpers.logger.error(`Could not add progression task jobs for room ${roomId}: ${jobsResult.reason}`);
        return [];
    }

    if (moderationsInsertResult.status === 'rejected') {
        helpers.logger.error(`Could not insert moderations when logging progression tasks for room ${roomId}: ${moderationsInsertResult.reason}`);
        return [];
    }

    const jobs = jobsResult.value;

    return jobs;
}

async function filterProgressionTasks(options: ProgressionTasksContextOptions) {
    const { progressionTasks, roomId, helpers } = options;

    // resolved = should be handled
    // rejected = cooldown or something else is not verified
    // undefined = should be skipped
    const settledProgressionTasks = await Promise.allSettled(progressionTasks.map(async (progressionTask) => {
        const { id: progressionTaskId, active = true, cooldown, maxAttempts } = progressionTask;
        const { blockProgression = true, messageAmount, durationMs: cooldownMs } = cooldown ?? {};
        const jobKey = generateProgressionJobKey(roomId, progressionTaskId);

        if (!active) {
            return;
        }

        // skip this task if we have reached the maximum amount of attempts
        if (maxAttempts) {
            const moderations = await getCompletedModerationsByJobKey(jobKey, maxAttempts);
            const moderationAmount = moderations?.length ?? 0;

            // guard: check if we have failed moderations
            if (moderationAmount >= maxAttempts) {
                helpers.logger.info(`The maximum amount of attempts has been reached for job ${jobKey}. Attempts: ${moderationAmount}, max attempts: ${maxAttempts}.`);
                return;
            }
        }

        // check if we need to verify the cooldown or new message amount before adding the job
        if (messageAmount || cooldownMs) {
            const lastModeration = await getLastCompletedModerationByJobKey(jobKey);
            const lastModerationDate = dayjs(lastModeration?.created_at);

            // check if we need to verify the cooldown before adding the job
            // NOTE: first check this, because no fetching of messages is required
            if (cooldownMs && lastModeration) {
                const cooldownRemainder = lastModerationDate.add(cooldownMs, 'ms').diff(dayjs(), 'ms');
                const isCoolingDown = cooldownRemainder > 0;

                // guard: check if the cooldown is valid
                if (isCoolingDown) {
                    helpers.logger.info(`The cooldown is still active for job ${jobKey}. Cooldown remaining: ${cooldownRemainder}ms.`);

                    if (blockProgression) {
                        throw Error(`Progression task ${progressionTaskId} for room ${roomId} is still cooling down and should block progress. Cooldown: ${cooldownMs}ms.`);
                    } else {
                        helpers.logger.info(`Progression task ${progressionTaskId} for room ${roomId} is still cooling down, but should NOT block progress. Cooldown: ${cooldownMs}ms.`);
                        return;
                    }
                }
            }

            // check if we need to verify the amount of messages before adding the job
            if (messageAmount && lastModeration) {
                const fromDate = (lastModeration ? lastModerationDate : undefined);
                const newMessages = await getMessagesAfter({
                    roomId,
                    fromDate,
                });
                const newMessageAmount = newMessages.length;

                // guard: check if we have enough messages
                if (newMessageAmount < messageAmount) {
                    helpers.logger.info(`The new amount of messages after ${lastModerationDate} is not enough for job ${jobKey}. Required: ${messageAmount}, actual: ${newMessageAmount}.`);

                    if (blockProgression) {
                        throw Error(`Progression task ${progressionTaskId} for room ${roomId} does not have enough messages and should block progress. Required: ${messageAmount}, actual: ${newMessageAmount}.`);
                    } else {
                        helpers.logger.info(`Progression task ${progressionTaskId} for room ${roomId} does not have enough new messages, but should NOT block progress. Required: ${messageAmount}, actual: ${newMessageAmount}.`);
                        return;
                    }
                }
            }
        }

        return progressionTask;
    }));
    const erroredProgressionTasks = settledProgressionTasks.filter((settledProgressionTask) => {
        return settledProgressionTask.status === 'rejected';
    });
    const hasErroredProgressionTasks = erroredProgressionTasks.length > 0;
    const fulfilledProgressionTasks = settledProgressionTasks.filter((settledProgressionTask) => {
        return settledProgressionTask.status === 'fulfilled';
    });
    const settledValidProgressionTasks = fulfilledProgressionTasks.filter((fulfilledProgressionTask) => {
        return fulfilledProgressionTask.status === 'fulfilled' && fulfilledProgressionTask.value !== undefined;
    }) as PromiseFulfilledResult<ProgressionTask>[];
    const validProgressionTasks = settledValidProgressionTasks.map((settledValidProgressionTask) => {
        return settledValidProgressionTask.value;
    });

    return {
        hasErroredProgressionTasks,
        erroredProgressionTasks,
        validProgressionTasks,
    };
}

/**
 * Generate a job key for a progression task to be unique for each room.
 */
function generateProgressionJobKey(roomId: string, progressionTaskId: string) {
    const jobKey = `room-${roomId}-progression-task-${progressionTaskId}`;
    return jobKey;
}
