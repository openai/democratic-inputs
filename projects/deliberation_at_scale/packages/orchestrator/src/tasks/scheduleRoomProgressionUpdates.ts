import { Helpers } from "graphile-worker";

import { supabaseClient } from "../lib/supabase";
import { UpdateRoomProgressionPayload } from "./updateRoomProgression";

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

    // TMP: disabled for now
    // activeRooms.map((activeRoom) => {
    //     const { id: roomId } = activeRoom;
    //     const newJobPayload: UpdateRoomProgressionPayload = {
    //         roomId,
    //     };

    //     helpers.logger.info(`Scheduling progression update for room ${roomId}...`);
    //     helpers.addJob("updateRoomProgression", newJobPayload);
    // });
}
