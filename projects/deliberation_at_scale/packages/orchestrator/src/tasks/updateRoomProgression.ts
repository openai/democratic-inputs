import { Helpers } from "graphile-worker";
import { isObject, min, set } from "radash";

import { progressionTopology } from "../constants";
import { supabaseClient, Moderation } from "../lib/supabase";
import { waitForAllModerationCompletions } from "../lib/graphileWorker";
import { BaseProgressionWorkerResponse, BaseProgressionWorkerTaskPayload, ProgressionTask, RoomStatus } from "src/types";
import { Database } from "src/generated/database-public.types";
import dayjs, { Dayjs } from "dayjs";

export interface UpdateRoomProgressionPayload {
    roomId: string;
}

/**
 * This task determines whether a single room can progress to a new phase in the deliberation.
 * A configurable topology of a succesful deliberation is used as a reference to determine all the steps.
 */
export default async function updateRoomProgression(payload: UpdateRoomProgressionPayload, helpers: Helpers) {
    const { roomId } = payload;
    const roomData = await supabaseClient.from('rooms').select().eq('id', roomId);
    const room = roomData?.data?.[0];

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

    const currentLayerVerifications = currentTopologyLayer.verifications.filter((verification) => verification.active ?? true);
    const fallbackVerifications = progressionTopology.layers.slice(0, currentTopologyLayerIndex).flatMap((topologyLayer) => {
        return topologyLayer.verifications.filter((verification) => {
            const { active = true, fallback = false } = verification;

            return active && fallback;
        });
    });
    const [currentLayerVerificationsResult, fallbackVerificationResults] = await Promise.allSettled([
        waitForAllProgressionTasks({
            progressionTasks: currentLayerVerifications,
            roomId,
            helpers,
        }),
        waitForAllProgressionTasks({
            progressionTasks: fallbackVerifications,
            roomId,
            helpers,
        }),
    ]);

    if (currentLayerVerificationsResult.status === 'rejected' || fallbackVerificationResults.status === 'rejected') {
        throw Error(`Could not update progression because one of the verification groups failed. Room ID: ${roomId}`);
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
                return progressionTopology.layers.findIndex((topologyLayer) => {
                    return topologyLayer.verifications.some((verification) => {
                        return verification.id === failedProgressionTaskId;
                    });
                });
            })) ?? 0;
            const fallbackLayer = progressionTopology.layers[minimumFallbackLayerIndex];
            const fallbackRoomStatus = fallbackLayer.roomStatus;

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

    // progress to the new status
    // NOTE: this can be done asynchronously
    updateRoomStatus({
        roomId,
        roomStatus: nextProgressionLayer.roomStatus,
        helpers,
    });
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
    const jobs = await addProgressionTaskJobs(options);
    const jobIds = jobs.map((job) => {
        if (job.status !== 'fulfilled') {
            return;
        }

        return job.value.id;
    }).filter((jobId): jobId is string => {
        return !!jobId;
    });

    const completedModerationTuples = await waitForAllModerationCompletions({
        jobIds,
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
            helpers.logger.error(`A job failed to complete for the following reason: ${failedModerationTuple.reason}`);
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
    const result = moderation?.result as unknown as BaseProgressionWorkerResponse;

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
    const { hasErroredProgressionTasks, validProgressionTasks } = await filterProgressionTasks(options);

    if (hasErroredProgressionTasks) {
        throw Error(`Could not add progression task jobs for room ${roomId} because one of the verifications failed before executing the jobs. This is likely due to a cooldown which is set to blocking.`);
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
    const { progressionTasks, roomId } = options;

    // resolved = should be handled
    // rejected = cooldown or something else is not verified
    // undefined = should be skipped
    const settledProgressionTasks = await Promise.allSettled(progressionTasks.map(async (progressionTask) => {
        const { id: progressionTaskId, active, cooldown, maxAttempts } = progressionTask;
        const { blockProgression = true, messageAmount, ms: cooldownMs } = cooldown ?? {};
        const jobKey = generateProgressionJobKey(roomId, progressionTaskId);

        if (!active) {
            return;
        }

        // check if we need to verify the amount of messages before adding the job
        if (messageAmount) {
            const newMessages = await getMessagesAfter(roomId, dayjs());
            const newMessageAmount = newMessages.length;

            // guard: check if we have enough messages
            if (newMessageAmount < messageAmount) {
                if (blockProgression) {
                    throw Error(`Progression task ${progressionTaskId} for room ${roomId} does not have enough messages and should block progress. Required: ${messageAmount}, actual: ${newMessageAmount}.`);
                } else {
                    return;
                }
            }
        }

        // check if we need to verify the cooldown before adding the job
        if (cooldownMs) {
            const moderations = await getModerationsByJobKey(jobKey, 1);
            const lastModeration = moderations[0];
            const lastModerationDate = dayjs(lastModeration?.created_at);
            const isCoolingDown = lastModerationDate.add(cooldownMs, 'ms').isAfter(dayjs());

            // guard: check if the cooldown is valid
            if (isCoolingDown) {
                if (blockProgression) {
                    throw Error(`Progression task ${progressionTaskId} for room ${roomId} is still cooling down and should block progress. Cooldown: ${cooldownMs}ms.`);
                } else {
                    return;
                }
            }
        }

        // TODO: check maxAttempts

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
        validProgressionTasks,
    };
}

interface UpdateRoomStatusOptions {
    roomId: string;
    roomStatus: RoomStatus;
    helpers: Helpers
}

/**
 * Helper to update the room status in the database.
 */
async function updateRoomStatus(options: UpdateRoomStatusOptions) {
    const { roomId, roomStatus, helpers } = options;
    const newRoomData = await supabaseClient.from('rooms').update({
        status_type: roomStatus,
    }).eq('id', roomId);

    helpers.logger.info(`Room ${roomId} has a new room status: ${roomStatus} (affected: ${newRoomData.count})`);
}

/**
 * Get x amount of moderations for a specific job key.
 */
async function getModerationsByJobKey(jobKey: string, limit = 100) {
    const moderationsData = await supabaseClient
        .from('moderations')
        .select()
        .eq('job_key', jobKey)
        .limit(limit);
    const moderations = moderationsData?.data ?? [];

    return moderations;
}

/**
 * Get all the messages that are created after a certain time.
 */
async function getMessagesAfter(roomId: string, fromDate: Dayjs, limit = 100) {
    const messagesData = await supabaseClient
        .from('messages')
        .select()
        .eq('room_id', roomId)
        .gte('created_at', fromDate.toISOString())
        .limit(limit);
    const messages = messagesData?.data ?? [];

    return messages;
}

function generateProgressionJobKey(roomId: string, progressionTaskId: string) {
    const jobKey = `room-${roomId}-progression-task-${progressionTaskId}`;
    return jobKey;
}
