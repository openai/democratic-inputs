import { createClient } from '@supabase/supabase-js';

import { Database } from '../generated/database.types';
import { SUPABASE_URL, SUPABASE_KEY } from "../constants";

const supabaseClient = createClient<Database>(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
        auth: {
            persistSession: false,
        }
    }
);

export default supabaseClient;

export type Message = Database["public"]["Tables"]["messages"]["Row"];
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

