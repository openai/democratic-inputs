import { createClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';

import { SUPABASE_URL, SUPABASE_KEY } from "../constants";
import { Database, Json } from 'src/generated/database-public.types';

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

export interface selectMessagesPayload {
    //message: Message;
    historyAmountSeconds?: number,
    historyAmountMessages?: number,
    historyAllMessages?: boolean,
    historySpecifiedLayers?: Array<string>
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
export async function getTopic(roomId: string) {
    const topicId = supabaseClient.from("rooms").select("topic_id").eq("id", roomId);
    const topic = supabaseClient.from("topics").select("content").eq("id", topicId);

    return topic;
}

export interface SelectMessageOptions {
    historyAmountSeconds?: number;
    historyAmountMessages?: number;
    historyAllMessages?: boolean;
    historySpecifiedLayers?: Array<string>;
}

export async function selectMessages(options: SelectMessageOptions): Promise<Message[] | null> {
    const { historyAllMessages, historyAmountMessages, historyAmountSeconds, historySpecifiedLayers } = options;
    // Retrieve all messages from supabase
    let statement = supabaseClient.from("messages").select().eq("type", "chat");


    //Check if all messages need to be selected
    if (historyAllMessages) {
        //Select all messages

        //Check if we need to select a specified layer
        if (historySpecifiedLayers != null) {
            //TODO: select messages from a specific layer only
            //statement = statement.contains("layer_id", historySpecifiedLayers);
            console.log("Tried to select specific layers.");
        }

    } else {


        if (historyAmountSeconds != null) {
            //Select the messages based on time passed
            const historyDate = new Date();
            historyDate.setTime(historyDate.getTime() - 20*1000);

            const dateForStatement = historyDate.toISOString();

            console.log("HistoryTimeStamp", dateForStatement);
            statement = statement.gte("created_at", dateForStatement);
        }

        if (historyAmountMessages != null) {
            //Select the messages based on time passed
            statement = statement.order("created_at", {ascending: false}).limit(historyAmountMessages);
        }
    }

    const messages = await statement;

    // GUARD: Throw when we receive an error
    if (messages.error) {
        throw messages.error;
    }

    const result = messages.data;

    return result;
}

