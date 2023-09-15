import { createClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';

import { SUPABASE_URL, SUPABASE_KEY } from "../constants";
import { Database, Json } from 'src/generated/database-public.types';
import { getJobByKey } from './graphileWorker';

export const supabaseClient = createClient<Database>(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
        db: {
            schema: 'public',
        },
        auth: {
            persistSession: false,
        }
    }
);

export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Moderation = Database["public"]["Tables"]["moderations"]["Row"];
export type MessageType = Database['public']['Enums']['messageType'];

export interface SendMessageOptions {
    active?: boolean;
    type: MessageType;
    roomId: string;
    content: string;
}

export async function sendBotMessage(options: Omit<SendMessageOptions, 'type'>) {
    return sendMessage({
        ...options,
        type: 'bot',
    });
}

export async function sendMessage(options: SendMessageOptions) {
    const { active = true, type, roomId, content } = options;

    await supabaseClient.from("messages").insert({
        active,
        type,
        room_id: roomId,
        content,
    });
}

export interface StoreModerationResultOptions {
    jobKey: string;
    result: Json;
}

export async function storeModerationResult(options: StoreModerationResultOptions) {
    const { jobKey, result } = options;

    await supabaseClient.from("moderations").update({
        result,
        completedAt: dayjs().toISOString(),
    }).eq("job_key", jobKey).is("result", null);
}
