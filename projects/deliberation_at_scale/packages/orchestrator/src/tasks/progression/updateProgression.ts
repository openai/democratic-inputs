import { MESSAGES_TABLE_NAME } from "@deliberation-at-scale/common";
import { Helpers } from "graphile-worker";
import supabaseClient from "src/lib/supabase";

export interface UpdateProgressionPayload {
    roomId: string;
}

export default async function updateProgression(payload: UpdateProgressionPayload, helpers: Helpers) {
    const { roomId } = payload;
    const roomData = await supabaseClient.from(MESSAGES_TABLE_NAME).select().eq('id', roomId);
    const room = roomData?.data?.[0];

    // guard: check if the room is valid
    if (!roomId || !room) {
        throw Error(`Could not update progression because the room was not found. Room ID: ${roomId}`);
    }

    helpers.logger.info(`Running update progression task for room: ${roomId}`);
}
