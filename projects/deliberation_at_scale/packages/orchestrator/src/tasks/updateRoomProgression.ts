import { Helpers } from "graphile-worker";
import { isObject, min } from "radash";

import { progressionTopology } from "../constants";
import { supabaseClient, Moderation } from "../lib/supabase";
import { generateProgressionJobKey, waitForAllModerationCompletions } from "../lib/graphileWorker";
import { BaseProgressionWorkerResponse, BaseProgressionWorkerTaskPayload, ProgressionTask, RoomStatus } from "src/types";
import { Database } from "src/generated/database-public.types";

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

interface AddProgressionTaskJobs {
    progressionTasks: ProgressionTask[];
    roomId: string;
    helpers: Helpers;
}

/**
 * Helper to add all progression tasks as jobs to the job system. Along with this it also adds a moderation to the database.
 * This allows us to track which progression tasks are triggered in the past to filter them for cooldowns and maximum attempts.
 */
async function addProgressionTaskJobs(options: AddProgressionTaskJobs) {
    const { progressionTasks, roomId, helpers } = options;
    const filteredProgressionTasks = progressionTasks.filter((progressionTask) => {
        const { active, cooldown } = progressionTask;

        // TODO: check if whether this job is allowed to be added based on the cooldown or other rules
        // TODO: determine whether a cooldown would fail or succeed the job?

        return active ?? true;
    });

    // run in parallel to optimize speed of these tasks
    const [jobsResult, moderationsInsertResult] = await Promise.allSettled([
        Promise.allSettled(filteredProgressionTasks.map((progressionTask) => {
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

        supabaseClient.from("moderations").insert(filteredProgressionTasks.map((progressionTask) => {
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
