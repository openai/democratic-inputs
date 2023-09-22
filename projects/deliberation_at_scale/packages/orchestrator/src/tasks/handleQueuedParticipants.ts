import dayjs from "dayjs";
import { draw, shuffle } from 'radash';

import { supabaseClient } from "../lib/supabase";
import { Helpers, quickAddJob } from "graphile-worker";
import { createExternalRoom } from "../lib/whereby";
import { MAX_ROOM_DURATION_MS, PARTICIPANTS_PER_ROOM, PARTICIPANT_PING_EXPIRY_TIME_MS } from "../config/constants";

export interface HandleParticipantsPayload {

}

// if somebody enters the lobby a participant should be created for a user
// if somebody leaves the lobby the participant should be removed from the user
// to check if somebody is in the lobby and active the user sends a ping every second to signal that the participant is still in the lobby
// after a certain period the user will be seen as inactive, the participant will be removed.
// if more than N participants are in the lobby some sort of algorithm needs to be used to assign people
// this should be linked to the other groups effort which have the Python script for assigning good groups
export default async function handleQueuedParticipants(payload: HandleParticipantsPayload, helpers: Helpers) {
    try {
        await deactivateInactiveParticipants(helpers);
        await performDynamicGroupSlicing(helpers);
    } catch (error) {
        helpers.logger.error(`An error occured when handling queued participants: ${error}`);
    }

    // reschedule
    // reschedule();
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
        .lt('last_seen_at', minimumLastSeenAt.toISOString());
    const { count, error } = deactivatedQueuedParticipants;

    if (error) {
        helpers.logger.error(`An error occured when deactivating queued participants: ${JSON.stringify(error)}`);
        return;
    }

    helpers.logger.error(`Deactivated ${count} queued participants.`);
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
    // TODO: this is where we can add the logic for the dynamic group slicing algorithm from the Sortition Foundation
    const assignRoomPromises: Promise<boolean>[] = [];
    while (shuffledParticipants.length >= PARTICIPANTS_PER_ROOM) {
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
        await Promise.allSettled(assignRoomPromises);
    } catch (error) {
        helpers.logger.error(`An error occurred when : ${error}`);
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
        helpers.logger.error(`Could not create an external room, participants: ${JSON.stringify(participantIds)}`);
        return false;
    }

    if (!selectedTopicId) {
        helpers.logger.error(`Could not find a topic candidate for a new room, topic IDs: ${JSON.stringify(topicIds)}`);
        return false;
    }

    const insertRoomResult = await supabaseClient.from('rooms').insert({
        active: true,
        topic_id: selectedTopicId,
        starts_at: dayjs().toISOString(),
        external_room_id: externalRoom.roomURL,
    }).select();
    const roomId = insertRoomResult?.data?.[0].id;

    if (!roomId) {
        helpers.logger.error(`Could not create a new room for topic ${selectedTopicId} and external room: ${JSON.stringify(externalRoom)}`);
        return false;
    }

    helpers.logger.info(`Successfully created a new room with ID ${roomId}, with external room: ${JSON.stringify(externalRoom)}`);

    // TODO: consider checking whether everyone is still queued

    const assignParticipantsResult = await supabaseClient.from('participants').update({
        room_id: roomId,
        status: 'waiting_for_confirmation',
    }).in('id', [participantIds]);

    if (assignParticipantsResult.error) {
        helpers.logger.error(`Could not assign participants to room ${roomId}, participants: ${JSON.stringify(participantIds)}`);
        return false;
    }

    return true;
}

/**
 * Reschedule this job for the next iteration
 */
// function reschedule() {
//     // schedule this job n seconds after the last invocation
//     quickAddJob({}, "lobby", new Date(), {
//         runAt: new Date(
//             Date.now() +
//             1_000 * TASK_INTERVAL_SECONDS
//         ),
//         jobKey: "lobby",
//         jobKeyMode: "preserve_run_at",
//     });
// }
