import { Helpers } from "graphile-worker";
import { isEmpty } from "radash";

import { progressionTopology } from "../constants";
import supabaseClient from "../lib/supabase";
import { waitForAllJobCompletions } from "../lib/graphileWorker";

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

    const activeVerifications = currentTopologyLayer.verifications.filter((verification) => verification.active ?? true);
    const verificationJobs = await Promise.allSettled(activeVerifications.map((verification) => {
        const { id: taskId, context } = verification;

        helpers.logger.info(`Adding verification job ${taskId} for room ${roomId}.`);
        return helpers.addJob(taskId, {
            progressionContext: context,
        });
    }));
    const verificationJobIds = verificationJobs.map((job) => {
        if (job.status !== 'fulfilled') {
            return;
        }

        return job.value.id;
    }).filter((jobId): jobId is string => {
        return !!jobId;
    });

    const completedVerificationJobs = await waitForAllJobCompletions({
        jobIds: verificationJobIds,
    });
    const failedVerificationTaskIds = completedVerificationJobs.find((completedJob) => {

        if (completedJob.status === 'rejected') {
            return 'unknown';
        }

        const taskId = completedJob.value?.task_identifier;

        if (!isEmpty(completedJob.value?.last_error)) {
            return taskId;
        }
    });
    const hasFailedVerifications = !isEmpty(failedVerificationTaskIds);

    // guard: if one verification has failed we cannot proceed to the next progression
    if (hasFailedVerifications) {
        helpers.logger.info(`Not all progression verifications passed for room ${roomId}: ${JSON.stringify(failedVerificationTaskIds)}.`);

        // TODO: this is where we will trigger any enrichments to give participants direction in how to proceed
        return;
    }

    helpers.logger.info(`All verifications passed for ${roomId} in progression layer ${currentTopologyLayerId}!`);

    const nextProgressionLayer = progressionTopology.layers?.[currentTopologyLayerIndex + 1];

    // guard: check if there is a next layer
    if (!nextProgressionLayer) {
        return;
    }

    const newRoomStatus = nextProgressionLayer.roomStatus;
    const newRoomData = await supabaseClient.from('rooms').update({
        status_type: newRoomStatus,
    }).eq('id', roomId);

    helpers.logger.info(`Room ${roomId} has a new room status: ${newRoomStatus} (affected: ${newRoomData.count})`);
}
