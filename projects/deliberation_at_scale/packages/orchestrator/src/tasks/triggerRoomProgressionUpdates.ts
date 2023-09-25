import { Helpers } from "graphile-worker";

import { supabaseClient } from "../lib/supabase";
import { UpdateRoomProgressionPayload } from "./updateRoomProgression";
import { ENABLE_SINGLE_ROOM_TESTING, ONE_SECOND_MS, TEST_ROOM_ID_ALLOWLIST } from "../config/constants";
import { reschedule } from "../scheduler";

export interface TriggerRoomProgressionUpdatesPayload {
}

/**
 * This task schedules progression update tasks for all active rooms.
 * This means individual runners can take onto one room, because a progression check is quite an heavy task.
 */
export default async function triggerRoomProgressionUpdates(payload: TriggerRoomProgressionUpdatesPayload, helpers: Helpers) {
    try {
        const activeRoomsData = await supabaseClient
            .from('rooms')
            .select()
            .eq('active', true)
            .not('starts_at', 'is', null);
        const activeRooms = activeRoomsData?.data ?? [];
        const activeRoomsAmount = activeRooms.length;

        helpers.logger.info(`Scheduling progression updates for all ${activeRoomsAmount} active rooms...`);

        activeRooms.map((activeRoom) => {
            const { id: roomId } = activeRoom;
            const jobKey = `updateRoomProgression-${roomId}`;
            const newJobPayload: UpdateRoomProgressionPayload = {
                roomId,
                jobKey,
            };

            // guard: skip when in testing mode and room is not in allowlist
            if (ENABLE_SINGLE_ROOM_TESTING && !TEST_ROOM_ID_ALLOWLIST.includes(roomId)) {
                return;
            }

            helpers.logger.info(`Scheduling progression update for room ${roomId}...`);
            helpers.addJob("updateRoomProgression", newJobPayload, {
                jobKey,
            });
        });
    } catch (error) {
        helpers.logger.error(`Error while scheduling progression updates: ${JSON.stringify(error)}`);
    }

    await reschedule<TriggerRoomProgressionUpdatesPayload>({
        workerTaskId: "triggerRoomProgressionUpdates",
        jobKey: "triggerRoomProgressionUpdates",
        intervalMs: ONE_SECOND_MS * 10,
        payload: {},
        helpers,
    });
}
