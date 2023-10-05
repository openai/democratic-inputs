import dayjs from "dayjs";
import { draw, shuffle } from 'radash';
import { Helpers } from "graphile-worker";

import { supabaseClient } from "../lib/supabase";
import { createExternalRoom } from "../lib/whereby";
import { MAX_ROOM_AMOUNT_PER_JOB, MAX_ROOM_DURATION_MS, ONE_SECOND_MS, PARTICIPANTS_PER_ROOM, PARTICIPANT_CONFIRM_EXPIRY_TIME_MS, PARTICIPANT_PING_EXPIRY_TIME_MS } from "../config/constants";
import { reschedule } from "../scheduler";

export interface HandleQueuedParticipantsPayload {
    jobKey: string;
}

// if somebody enters the lobby a participant should be created for a user
// if somebody leaves the lobby the participant should be removed from the user
// to check if somebody is in the lobby and active the user sends a ping every second to signal that the participant is still in the lobby
// after a certain period the user will be seen as inactive, the participant will be removed.
// if more than N participants are in the lobby some sort of algorithm needs to be used to assign people
// this should be linked to the other groups effort which have the Python script for assigning good groups
export default async function handleQueuedParticipants(payload: HandleQueuedParticipantsPayload, helpers: Helpers) {
    try {
        await deactivateInactiveParticipants(helpers);
        await deactivateExpiredRooms(helpers);
        await performDynamicGroupSlicing(helpers);
    } catch (error) {
        helpers.logger.error(`An error occured when handling queued participants: ${error}`);
    }

    await reschedule<HandleQueuedParticipantsPayload>({
        workerTaskId: "handleQueuedParticipants",
        jobKey: "handleQueuedParticipants",
        intervalMs: ONE_SECOND_MS * 2,
        payload: {
            jobKey: "handleQueuedParticipants",
        },
        helpers,
    });
}

/**
 * Deactivate participants that have not pinged in a while
 */
async function deactivateInactiveParticipants(helpers: Helpers) {
    const minimumLastSeenAt = dayjs().subtract(PARTICIPANT_PING_EXPIRY_TIME_MS, 'ms');

    // delete participants where ping failed and they are still in queu
    const deactivatedQueuedParticipants = await supabaseClient
        .from("participants")
        .update({ active: false })
        .eq('status', "queued")
        .eq("active", true)
        .lt('last_seen_at', minimumLastSeenAt.toISOString())
        .select();
    const { data: deactivatedParticipants, error } = deactivatedQueuedParticipants;

    if (error) {
        helpers.logger.error(`An error occured when deactivating queued participants: ${JSON.stringify(error)}`);
        return;
    }

    if (deactivatedParticipants.length <= 0) {
        helpers.logger.info(`No queued participants were deactivated.`);
        return;
    }

    helpers.logger.error(`Deactivated ${deactivatedParticipants.length} queued participants.`);
}

/**
 * Deactivate rooms that are expired because participants are not joining quickly enough
 */
async function deactivateExpiredRooms(helpers: Helpers) {
    const minimumUpdatedAt = dayjs().subtract(PARTICIPANT_CONFIRM_EXPIRY_TIME_MS, 'ms');

    // delete participants where ping failed and they are still in queu
    const { data: deactivatedParticipants, error } = await supabaseClient
        .from("participants")
        .update({ active: false, status: 'end_of_session' })
        .eq('status', "waiting_for_confirmation")
        .eq("active", true)
        .lt('updated_at', minimumUpdatedAt.toISOString())
        .select();

    if (error) {
        helpers.logger.error(`An error occurred when deactivating expired rooms: ${JSON.stringify(error)}`);
        return;
    }

    if (deactivatedParticipants.length <= 0) {
        helpers.logger.info(`No expired confirming participants were deactivated.`);
        return;
    }

    helpers.logger.error(`Deactivated ${deactivatedParticipants.length} confirming participants. Now also deactivating the rooms...`);

    const roomIds = deactivatedParticipants.map((participant) => {
        return participant.room_id;
    });

    const { data: deactivatedRooms } = await supabaseClient
        .from("rooms")
        .update({ active: false })
        .in('id', roomIds)
        .select();

    helpers.logger.error(`Deactivated ${deactivatedRooms?.length ?? 0} rooms. Participants should be automatically notified: ${JSON.stringify(deactivatedRooms)}`);
}

/**
 * Assigns participants in the lobby to a room
 */
async function performDynamicGroupSlicing(helpers: Helpers) {
    const queuedParticipantsResult = await supabaseClient
        .from('participants')
        .select()
        .eq('active', true)
        .eq('status', 'queued');
    const queuedParticipants = queuedParticipantsResult.data ?? [];
    const queuedParticipantsAmount = queuedParticipants?.length ?? 0;

    helpers.logger.info(`There are currently ${queuedParticipantsAmount} queued participants waiting for a room...`);

    // guard: check if there are enough participants to assign to a room
    if (queuedParticipantsAmount < PARTICIPANTS_PER_ROOM) {
        helpers.logger.info(`Not enough participants to assign to a room, waiting for more participants...`);
        return;
    }

    // will sort the participants randomly for now and assign four of them per room
    const shuffledParticipants = shuffle(queuedParticipants);

    // get all current topics and put them in an array so the participants can be randomly assigned
    const topicsResult = await supabaseClient.from('topics').select().eq('active', true);
    const topics = topicsResult.data ?? [];
    const topicIds = topics.map((topic) => {
        return topic.id;
    });

    // guard we cannot do anything if we do not have topics
    if (!topics) {
        helpers.logger.error('No valid topics could be found to assign to a room with participants.');
        return;
    }

    // group queued participants in different rooms
    // TODO: this is where we can add the logic for the dynamic group slicing algorithm
    const assignRoomPromises: Promise<boolean>[] = [];
    while (shuffledParticipants.length >= PARTICIPANTS_PER_ROOM && assignRoomPromises.length < MAX_ROOM_AMOUNT_PER_JOB) {
        const newRoomParticipantIds: string[] = [];
        for (let i = 0; i < PARTICIPANTS_PER_ROOM; i++) {
            const participantCandidate = shuffledParticipants.pop();
            const participantCandidateId = participantCandidate?.id;

            if (!participantCandidateId) {
                helpers.logger.error(`An invalid participant candidate was found when slicing groups: ${JSON.stringify(participantCandidate)}`);
                continue;
            }

            // add to the room
            newRoomParticipantIds.push(participantCandidateId);
        }

        // guard: make sure there are enough participants
        if (newRoomParticipantIds.length < PARTICIPANTS_PER_ROOM) {
            helpers.logger.error(`Not enough participants were found to assign to a room: ${JSON.stringify(newRoomParticipantIds)}`);
            continue;
        }

        // store all the promises in an array so we can wait for them to finish
        assignRoomPromises.push(assignParticipantsToRoom({
            helpers,
            participantIds: newRoomParticipantIds,
            topicIds,
        }));
    }

    try {
        const assignResults = await Promise.allSettled(assignRoomPromises);

        // check if all promises were successful
        const successfulAssignments = assignResults.filter((result) => {
            return result.status === 'fulfilled';
        });
        const failedAssignments = assignResults.filter((result) => {
            return result.status === 'rejected';
        });

        helpers.logger.info(`Successfully assigned ${successfulAssignments.length} rooms.`);
        helpers.logger.error(`Failed to assign ${failedAssignments.length} rooms.`);

        // debug all failed reasons
        failedAssignments.forEach((failedAssignment) => {
            helpers.logger.error(`Failed to assign room:`);
            helpers.logger.error(JSON.stringify(failedAssignment));
        });
    } catch (error) {
        helpers.logger.error(`An error occured when assigning all participants to rooms: ${error}`);
    }
}

interface AssignParticipantsToRoomOptions {
    participantIds: string[];
    topicIds: string[];
    helpers: Helpers;
}

async function assignParticipantsToRoom(options: AssignParticipantsToRoomOptions) {
    const { participantIds, topicIds, helpers } = options;
    const roomEndAt = dayjs().add(MAX_ROOM_DURATION_MS, 'ms');
    const externalRoom = await createExternalRoom(roomEndAt);
    const selectedTopicId = draw(topicIds);

    if (!externalRoom) {
        return Promise.reject(`Could not create an external room, participants: ${JSON.stringify(participantIds)}`);
    }

    if (!selectedTopicId) {
        return Promise.reject(`Could not find a topic candidate for a new room, topic IDs: ${JSON.stringify(topicIds)}`);
    }

    const insertRoomResult = await supabaseClient.from('rooms').insert({
        active: true,
        topic_id: selectedTopicId,
        starts_at: dayjs().toISOString(),
        external_room_id: externalRoom.roomUrl,
    }).select();
    const roomId = insertRoomResult?.data?.[0].id;

    if (!roomId) {
        return Promise.reject(`Could not create a new room for topic ${selectedTopicId} and external room: ${JSON.stringify(externalRoom)}`);
    }

    helpers.logger.info(`Successfully created a new room with ID ${roomId}, with external room: ${JSON.stringify(externalRoom)}`);

    // TODO: consider checking whether everyone is still queued
    const assignParticipantsResult = await supabaseClient.from('participants').update({
        room_id: roomId,
        status: 'waiting_for_confirmation',
    }).in('id', [participantIds]);

    if (assignParticipantsResult.error) {
        return Promise.reject(`Could not assign participants to room ${roomId}, participants: ${JSON.stringify(participantIds)}`);
    }

    helpers.logger.info(`Successfully assigned participants to room ${roomId}, participants: ${JSON.stringify(participantIds)}`);
    return true;
}
