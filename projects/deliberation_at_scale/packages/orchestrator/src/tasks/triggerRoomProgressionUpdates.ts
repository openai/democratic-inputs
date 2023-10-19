import { Helpers } from "graphile-worker";
import dayjs from "dayjs";

import { supabaseClient } from "../lib/supabase";
import { UpdateRoomProgressionPayload } from "./updateRoomProgression";
import { ENABLE_SINGLE_ROOM_TESTING, ONE_SECOND_MS, TEST_ROOM_ID_ALLOWLIST, UPDATE_ROOM_PROGRESSION_INTERVAL_MS } from "../config/constants";
import { reschedule } from "../scheduler";
import { captureEvent } from "../lib/sentry";
import { getRunnerUtils } from "../runner";

export interface TriggerRoomProgressionUpdatesPayload {
    // empty
}

/**
 * This task schedules progression update tasks for all active rooms.
 * This means individual runners can take onto one room, because a progression check is quite an heavy task.
 */
export default async function triggerRoomProgressionUpdates(payload: TriggerRoomProgressionUpdatesPayload, helpers: Helpers) {
    try {
        const minRoomCreatedAt = dayjs().subtract(1, "hour").toISOString();
        const minParticipantLastSeenAt = dayjs().subtract(60, "second").toISOString();
        const [roomsResult, activeParticipantsResult] = await Promise.allSettled([
            supabaseClient
                .from('rooms')
                .select()
                .eq('active', true)
                .not('starts_at', 'is', null)
                .gt('created_at', minRoomCreatedAt),
            supabaseClient
                .from('participants')
                .select()
                .eq('active', true)
                .gt('last_seen_at', minParticipantLastSeenAt),
        ]);

        // guard: check for rejections
        if (roomsResult.status === "rejected" || activeParticipantsResult.status === "rejected") {
            throw new Error(`Error while fetching active rooms or locked jobs.`);
        }

        const rooms = roomsResult.value?.data ?? [];
        const activeParticipants = activeParticipantsResult.value?.data ?? [];
        const activeParticipantsAmount = activeParticipants.length;
        const activeParticipantsRoomIds = activeParticipants.map((participant) => participant.room_id);
        const activeRooms = rooms.filter((room) => activeParticipantsRoomIds.includes(room.id));
        const activeRoomsAmount = activeRooms.length;

        helpers.logger.info(`Scheduling progression updates for all ${activeRoomsAmount} active rooms with ${activeParticipantsAmount} active participants...`);

        // console.log(activeRoomAmount);
        // await reschedule<TriggerRoomProgressionUpdatesPayload>({
        //     workerTaskId: "triggerRoomProgressionUpdates",
        //     jobKey: "triggerRoomProgressionUpdates",
        //     intervalMs: UPDATE_ROOM_PROGRESSION_INTERVAL_MS,
        //     payload: {},
        //     helpers,
        // });
        // return;
        await Promise.allSettled(activeRooms.map(async (activeRoom) => {
            const { id: roomId } = activeRoom;
            const jobKey = `updateRoomProgression-${roomId}`;
            const newJobPayload: UpdateRoomProgressionPayload = {
                roomId,
                jobKey,
            };
            const { rows: [existingJob] } = await getRunnerUtils().withPgClient((pgClient) => {
                return pgClient.query("SELECT * FROM graphile_worker.jobs WHERE key = $1", [jobKey]);
            });

            // guard: we need to check whether the existing job is currently being executed
            // and if so we will skip this room, because another worker is already working on it
            if (existingJob &&
                existingJob.attempts < existingJob.max_attempts &&
                Math.abs(dayjs().diff(dayjs(existingJob.run_at), 'ms')) < ONE_SECOND_MS * 60 * 2
            ) {
                helpers.logger.info(`Skipping room ${roomId} because it is already being worked on...`);
                return;
            }

            // guard: skip when in testing mode and room is not in allowlist
            if (ENABLE_SINGLE_ROOM_TESTING && !TEST_ROOM_ID_ALLOWLIST.includes(roomId)) {
                return;
            }

            helpers.logger.info(`Scheduling progression update for room ${roomId}...`);

            return await helpers.addJob("updateRoomProgression", newJobPayload, {
                jobKey,
            });
        }));
    } catch (error) {
        captureEvent({
            message: `Error while scheduling progression updates: ${JSON.stringify(error)}`,
            level: 'error',
            helpers,
        });
    }

    await reschedule<TriggerRoomProgressionUpdatesPayload>({
        workerTaskId: "triggerRoomProgressionUpdates",
        jobKey: "triggerRoomProgressionUpdates",
        intervalMs: UPDATE_ROOM_PROGRESSION_INTERVAL_MS,
        payload: {},
        helpers,
    });
}
