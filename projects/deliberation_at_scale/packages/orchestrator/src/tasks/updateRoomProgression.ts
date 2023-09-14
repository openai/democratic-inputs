import { Helpers } from "graphile-worker";
import { isEmpty, min } from "radash";

import { progressionTopology } from "../constants";
import supabaseClient from "../lib/supabase";
import { waitForAllJobCompletions } from "../lib/graphileWorker";
import { BaseProgressionWorkerTaskPayload, ProgressionTask, RoomStatus } from "src/types";

export interface UpdateRoomProgressionPayload {
    roomId: string;
}

/**
 * This task determines whether a single room can progress to a new phase in the deliberation.
 * A configurable topology of a succesful deliberation is used as a reference to determine all the steps.
 *
 * TODO: integrate fallback behaviour of previous phases that cause the deliberation to take a step back.
 */
export default async function updateRoomProgression(payload: UpdateRoomProgressionPayload, helpers: Helpers) {
    const { roomId } = payload;
    const roomData = await supabaseClient.from('rooms').select().eq('id', roomId);
    const room = roomData?.data?.[0];

    // guard: check if the room is valid
    if (!roomId || !room) {
        throw Error(`Could not update progression because the room was not found. Room ID: ${roomId}`);
    }

    const currentRoomStatus = room?.status_type ?? 'safe';
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
    const previousLayersFallbackVerifications = progressionTopology.layers.slice(0, currentTopologyLayerIndex).flatMap((topologyLayer) => {
        return topologyLayer.verifications.filter((verification) => {
            const { active = true, fallback = false } = verification;

            return active && fallback;
        });
    });
    const [currentLayerVerificationsResult, previousLayersVerificationResults] = await Promise.allSettled([
        waitForAllProgressionTasks({
            progressionTasks: currentLayerVerifications,
            roomId,
            helpers,
        }),
        waitForAllProgressionTasks({
            progressionTasks: previousLayersFallbackVerifications,
            roomId,
            helpers,
        }),
    ]);

    if (currentLayerVerificationsResult.status === 'rejected' || previousLayersVerificationResults.status === 'rejected') {
        helpers.logger.error(`Could not update progression because one of the verification groups failed. Room ID: ${roomId}`);
        return;
    }

    const { failedProgressionTaskIds: currentFailedProgressionTaskIds } = currentLayerVerificationsResult.value;
    const { failedProgressionTaskIds: previousFailedProgressionTaskIds } = previousLayersVerificationResults.value;
    const failedVerificationTaskIds = [...currentFailedProgressionTaskIds, ...previousFailedProgressionTaskIds];
    const hasFailedVerifications = failedVerificationTaskIds.length > 0;
    const hasFailedFallbackVerifications = previousFailedProgressionTaskIds.length > 0;

    // guard: if one verification has failed we cannot proceed to the next progression
    if (hasFailedVerifications) {
        helpers.logger.info(`Not all progression verifications passed for room ${roomId}: ${JSON.stringify(failedVerificationTaskIds)}.`);

        // guard: check if we need to fallback the room status
        if (hasFailedFallbackVerifications) {

            // find the minimum index of all the failed fallback verifications, because we want to fallback to the lowest possible layer
            const minimumFallbackLayerIndex = min(previousFailedProgressionTaskIds.map((failedProgressionTaskId) => {
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

    const completedJobs = await waitForAllJobCompletions({
        jobIds,
    });
    const failedJobs = completedJobs.filter((completedJob) => {

        if (completedJob.status === 'rejected') {
            return true;
        }

        if (!isEmpty(completedJob.value?.last_error)) {
            return true;
        }

        return false;
    });
    const failedProgressionTaskIds = failedJobs.map((failedJob) => {

        if (failedJob.status === 'rejected') {
            helpers.logger.error(`A job failed to complete for the following reason: ${failedJob.reason}`);
            return 'unknown';
        }

        const failedJobValue = failedJob.value;
        const failedJobPayload = failedJobValue?.payload as BaseProgressionWorkerTaskPayload;
        const progressionTaskId = failedJobPayload?.progressionTask?.id ?? 'unknown';

        return progressionTaskId;
    });

    return {
        completedJobs,
        failedProgressionTaskIds,
    };
}

interface AddProgressionTaskJobs {
    progressionTasks: ProgressionTask[];
    roomId: string;
    helpers: Helpers;
}

async function addProgressionTaskJobs(options: AddProgressionTaskJobs) {
    const { progressionTasks, roomId, helpers } = options;
    const filteredProgressionTasks = progressionTasks.filter((progressionTask) => {
        const { active } = progressionTask;

        return active ?? true;
    });
    const jobs = await Promise.allSettled(filteredProgressionTasks.map((progressionTask) => {
        const { id, workerTaskId } = progressionTask;

        helpers.logger.info(`Adding worker task ${workerTaskId} via progression task ${id} for room ${roomId}.`);

        // TODO: check if whether this job is allowed to be added based on the cooldown or other rules

        return helpers.addJob(workerTaskId, {
            progressionTask,
        } satisfies BaseProgressionWorkerTaskPayload);
    }));

    return jobs;
}

interface UpdateRoomStatusOptions {
    roomId: string;
    roomStatus: RoomStatus;
    helpers: Helpers
}

async function updateRoomStatus(options: UpdateRoomStatusOptions) {
    const { roomId, roomStatus, helpers } = options;
    const newRoomData = await supabaseClient.from('rooms').update({
        status_type: roomStatus,
    }).eq('id', roomId);

    helpers.logger.info(`Room ${roomId} has a new room status: ${roomStatus} (affected: ${newRoomData.count})`);
}
