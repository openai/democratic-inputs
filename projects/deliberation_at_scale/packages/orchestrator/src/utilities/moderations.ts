import dayjs from "dayjs";
import { Json } from "../generated/database-public.types";
import { supabaseClient } from "../lib/supabase";

export interface StoreModerationResultOptions {
    jobKey: string;
    result: Json;
    messageId?: string | null;
    roomId?: string | null;
    participantId?: string | null;
}

export async function storeModerationResult(options: StoreModerationResultOptions) {
    const { jobKey, result, messageId, roomId, participantId } = options;

    const { data, error } = await supabaseClient.from("moderations").update({
        result,
        completed_at: dayjs().toISOString(),
        message_id: messageId,
        room_id: roomId,
        participant_id: participantId,
    })
        .is("completed_at", null)
        .eq("job_key", jobKey)
        .select()
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        throw Error(`Could not store moderation result due to error: ${JSON.stringify(error)}`);
    }

    return data?.[0];
}

/**
 * Get x amount of completec moderations for a specific job key.
 */
export async function getCompletedModerationsByJobKey(jobKey: string, limit = 100) {
    const moderationsData = await supabaseClient
        .from('moderations')
        .select()
        .eq('active', true)
        .eq('job_key', jobKey)
        .not('completed_at', 'is', null)
        .order('created_at', { ascending: false })
        .limit(limit);
    const moderations = moderationsData?.data ?? [];

    return moderations;
}

/**
 * Get x amount of moderations for a specific job key.
 */
export async function getModerationsByJobKey(jobKey: string, limit = 100) {
    const moderationsData = await supabaseClient
        .from('moderations')
        .select()
        .eq('active', true)
        .eq('job_key', jobKey)
        .order('created_at', { ascending: false })
        .limit(limit);
    const moderations = moderationsData?.data ?? [];

    return moderations;
}

/**
 * Get the last moderation for a certain job key.
 */
export async function getLastCompletedModerationByJobKey(jobKey: string) {
    const moderations = await getCompletedModerationsByJobKey(jobKey, 1);
    const lastModeration = moderations?.[0];

    return lastModeration;
}
