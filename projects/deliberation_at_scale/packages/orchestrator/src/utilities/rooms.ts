import { Helpers } from "graphile-worker";
import { supabaseClient } from "../lib/supabase";
import { RoomStatus } from "../types";

/**
 * Get the room by ID
 */
export async function getRoomById(roomId: string) {
    const roomData = await supabaseClient
        .from('rooms')
        .select()
        .eq('active', true)
        .eq('id', roomId)
        .limit(1);

    return roomData.data?.[0];
}

export interface UpdateRoomStatusOptions {
    roomId: string;
    roomStatus: RoomStatus;
    helpers: Helpers
}

/**
 * Update the room status in the database.
 */
export async function updateRoomStatus(options: UpdateRoomStatusOptions) {
    const { roomId, roomStatus, helpers } = options;
    const newRoomData = await supabaseClient.from('rooms').update({
        status_type: roomStatus,
    }).eq('id', roomId);

    helpers.logger.info(`Room ${roomId} has a new room status: ${roomStatus} (affected: ${newRoomData.count})`);
}
