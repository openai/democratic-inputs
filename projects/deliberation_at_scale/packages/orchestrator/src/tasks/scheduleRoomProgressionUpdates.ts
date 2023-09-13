import { Helpers } from "graphile-worker";

import supabaseClient from "../lib/supabase";
import { UpdateRoomProgressionPayload } from "./updateRoomProgression";

export interface ScheduleRoomProgressionUpdatesPayload {
}

export default async function scheduleRoomProgressionUpdates(payload: ScheduleRoomProgressionUpdatesPayload, helpers: Helpers) {
    const activeRoomsData = await supabaseClient.from('rooms').select().eq('active', true).not('starts_at', 'is', null);
    const activeRooms = activeRoomsData?.data ?? [];
    const activeRoomsAmount = activeRooms.length;

    helpers.logger.info(`Scheduling progression updates for all ${activeRoomsAmount} active rooms...`);

    activeRooms.map((activeRoom) => {
        const { id: roomId } = activeRoom;
        const payload: UpdateRoomProgressionPayload = {
            roomId,
        };

        helpers.logger.info(`Scheduling progression update for room ${roomId}...`);
        helpers.addJob("updateRoomProgression", payload);
    });
}
