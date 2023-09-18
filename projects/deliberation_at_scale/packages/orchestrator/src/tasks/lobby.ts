
import supabase from "../lib/supabase";
import { Helpers, Logger, quickAddJob } from "graphile-worker";
import { createRoom } from "../lib/whereby";

// TODO: import this from the constants
const PARTICIPANTS_PER_ROOM = 3;
const MAXIMUM_MEETING_LENGTH_MINUTES = 60;


// if somebody enters the lobby a participant should be created for a user
// if somebody leaves the lobby the participant should be removed from the user
// to check if somebody is in the lobby and active the user sends a ping every second to signal that the participant is still in the lobby
// after a certain period the user will be seen as inactive, the participant will be removed.
// if more than N participants are in the lobby some sort of algorithm needs to be used to assign people
// this should be linked to the other groups effort which have the Python script for assigning good groups


// this task should run every so often. This task will also be responsible for removing inactive participants
/**
 * Run this task at most every n seconds
 */
const TASK_INTERVAL_SECONDS = 1;

function UTCToISOString(input: number) {
    return new Date(input).toISOString();
}

/**
  * @brief removes inactive participants
**/
async function removeInactiveParticipants(logger: Logger) {
    const inactiveTimeMilliseconds = 5 * 1000;
    const inactiveMaxMinutes = 10;

    const currentTimestamp = Date.now();


    // delete participants where ping failed and they are still in queu
    const pingInactiveParticipantsPromise = supabase
        .from("participants")
        .update({ active: false })
        .eq('status', "queued")
        .lt('last_seen_at', UTCToISOString(currentTimestamp - inactiveTimeMilliseconds));

    // deactivate participants when they are incative for more than x minutes
    // TODO: check if this is supposed to be here. This might be better done in the roomManager
    const inactiveForMinutesParticipantsPromise = supabase
        .from('participants')
        .update({
            status: 'end_of_session',
            active: false,
        })
        .lt('last_seen_at', UTCToISOString(currentTimestamp - (inactiveMaxMinutes * 60 * 1000)));

    const [pingInactiParticipants, inactiveForMinutesParticipants] =
        await Promise.all([pingInactiveParticipantsPromise, inactiveForMinutesParticipantsPromise]);

    if (pingInactiParticipants.error) {
        logger.error(`remove inactive participants, ${JSON.stringify(pingInactiParticipants.error)}`);
    }
    if (inactiveForMinutesParticipants.error) {
        logger.error(`remove participants after timeout, ${JSON.stringify(inactiveForMinutesParticipants.error)}`);
    }

}

function randomlySelectFromArray<Type>(arr: Array<Type>): Type {
    const selectIndex = Math.round(Math.random() * arr.length - 1);
    return arr[selectIndex];
}

async function createWherebyRoomAndAssignParticipants(particpantIDs: string[], topic_ids: string[], logger: Logger) {
    // creates a room with a random topic and updates the participants
    try {
        const roomEndtime = new Date(
            Date.now() + MAXIMUM_MEETING_LENGTH_MINUTES * 60 * 1000
        );
        const newRoom = await createRoom(roomEndtime);

        // create a new room in the database
        const insertRoomResult = await supabase.from('rooms').upsert({
            active: true,
            topic_id: randomlySelectFromArray(topic_ids),
            starts_at: new Date().toISOString(),
            external_room_id: newRoom.roomURL,
        }).select();


        if (insertRoomResult.error || !insertRoomResult.data[0].id) {
            throw new Error('creation of room failed');
        }
        const roomId = insertRoomResult.data[0].id;

        logger.info(`created room with room ID: ${roomId}`);

        // now assign the room to the participants
        const updateParticipantsPromises = particpantIDs.map((participant) => {
            return supabase.from('participants').update({
                room_id: roomId,
                status: 'waiting_for_confirmation',
            }).eq('id', participant);
        });

        await Promise.all(updateParticipantsPromises);
    } catch (error) {
        logger.error(`Failed in creating a Whereby room. Got the following error: ${JSON.stringify(error, null, 2)}`);
    }
}

/**
  * @brief shuffles array (puts it in a random order) and returns a copy
**/
function shuffleArray<Type>(arr: Array<Type>): Type[] {
    const newArray = arr.map((entry): Type & { _sortNumber?: number } => {
        const sortNumber = Math.random();
        return {
            ...entry,
            _sortNumber: sortNumber,
        };
    });
    newArray.sort((a, b) => ((a?._sortNumber || 0) - (b?._sortNumber || 0)));

    return newArray.map((entry): Type => {
        const newObj = { ...entry };
        delete newObj._sortNumber;
        return newObj;
    });
}

/**
* @brief assigns participants in the lobby to a discussion room
**/
async function assignParticipantsToRooms(logger: Logger) {
    // TODO: insert the more advanced logic in here for assigning participants

    // for now check how many participants we have. If more than a certain amount of users assign them to a room randomly
    const participants = await supabase
        .from('participants')
        .select()
        .eq('active', true)
        .eq('status', 'queued');

    logger.info(`current participant count: ${participants?.data?.length} ${JSON.stringify(participants)}`);
    if (((participants?.data?.length || 0) < PARTICIPANTS_PER_ROOM) || !participants?.data) {
        return;
    }
    // will sort the participants randomly for now and assign four of them per room
    const shuffledParticipants = shuffleArray(participants.data);

    // get all current topics and put them in an array so the participants can be randomly assigned
    const topicsResponse = await supabase.from('topics').select().eq('active', true);

    // guard we cannot do anything if we do not have topics
    if (topicsResponse.error || !topicsResponse?.data) {
        logger.error('no topics found cannot assign participants.');
        return;
    }


    const topicIds = topicsResponse.data.map((topic) => {
        return topic.id;
    });

    // assign participants to a whereby room per 4 participants
    const assignRoomPromises = [];
    while (shuffledParticipants.length >= PARTICIPANTS_PER_ROOM) {
        const currentParticipants = [];
        for (let i = 0; i < PARTICIPANTS_PER_ROOM; i++) {
            const currentParticipant = shuffledParticipants.pop();
            if (currentParticipant?.id) {
                currentParticipants.push(currentParticipant?.id);
            } else {
                // Error should basically never happen, however when it does it should be logged
                logger.error('participant without ID was found. The particpant:', currentParticipant);
            }
        }

        // TODO: create whereby room number
        assignRoomPromises.push(createWherebyRoomAndAssignParticipants(currentParticipants, topicIds, logger));
    }
    try {
        await Promise.all(shuffledParticipants);
    } catch (error) {
        logger.error(`error when assigning participants to rooms. Error: ${error}`);
    }
}

/**
* @brief: main task for managing the lobby
**/
export default async function lobbyTask(
    payload,
    helpers: Helpers
) {
    const { logger } = helpers;
    try {
        await removeInactiveParticipants(logger);
        await assignParticipantsToRooms(logger);
    } catch (error) {
        logger.error(`Error in lobby task. Error: ${error}`);
    }

    // reschedule
    reschedule();
}

/**
 * Reschedule this job for the next iteration
 */
function reschedule() {
    // schedule this job n seconds after the last invocation
    quickAddJob({}, "lobby", new Date(), {
        runAt: new Date(
            Date.now() +
            1_000 * TASK_INTERVAL_SECONDS
        ),
        jobKey: "lobby",
        jobKeyMode: "preserve_run_at",
    });
}