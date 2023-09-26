import { supabaseClient } from "../lib/supabase";

export async function getParticipantsByRoomId(roomId: string) {
    const participantsData = await supabaseClient
        .from("participants")
        .select()
        .eq("room_id", roomId);

    const participants = participantsData?.data ?? [];

    return participants;
}
