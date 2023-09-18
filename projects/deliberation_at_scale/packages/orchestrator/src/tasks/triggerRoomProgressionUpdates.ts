import { Helpers } from "graphile-worker";

import { supabaseClient } from "../lib/supabase";
import { UpdateRoomProgressionPayload } from "./updateRoomProgression";
import { ENABLE_ROOM_TESTING, TEST_ROOM_ID_ALLOWLIST } from "../config/constants";

export interface ScheduleRoomProgressionUpdatesPayload {
}

/**
 * This task schedules progression update tasks for all active rooms.
 * This means individual runners can take onto one room, because a progression check is quite an heavy task.
 */
export default async function scheduleRoomProgressionUpdates(payload: ScheduleRoomProgressionUpdatesPayload, helpers: Helpers) {
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
        const newJobPayload: UpdateRoomProgressionPayload = {
            roomId,
        };
        const jobKey = `updateRoomProgression-${roomId}`;

        // guard: skip when in testing mode and room is not in allowlist
        if (ENABLE_ROOM_TESTING && !TEST_ROOM_ID_ALLOWLIST.includes(roomId)) {
            return;
        }

        helpers.logger.info(`Scheduling progression update for room ${roomId}...`);
        helpers.addJob("updateRoomProgression", newJobPayload, {
            jobKey,
        });
    });
}
