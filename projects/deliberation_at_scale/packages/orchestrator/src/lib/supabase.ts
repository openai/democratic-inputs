import { createClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';

import { SUPABASE_URL, SUPABASE_KEY } from "../config/constants";
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
    messageId?: string | null;
    roomId?: string | null;
    participantId?: string | null;
}

export async function storeModerationResult(options: StoreModerationResultOptions) {
    const { jobKey, result, messageId, roomId, participantId } = options;

    await supabaseClient.from("moderations").update({
        result,
        completedAt: dayjs().toISOString(),
        message_id: messageId,
        room_id: roomId,
        participant_id: participantId,
    }).eq("job_key", jobKey).is("result", null);
}

export async function getPopulatedRoom(roomId: string) {
    const populatedRoomResult = await supabaseClient
        .from("rooms")
        .select(`
            id,
            active,
            status_type,
            topic_id,
            external_room_id,
            updated_at,
            created_at,
            topics (
                id
                active,
                content,
                original_topic_id,
                updated_at,
                created_at
            )
        `)
        .eq("id", roomId)
        .single();
    const populatedRoom = populatedRoomResult.data;

    return populatedRoom;
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
        }

    } else {


        if (historyAmountSeconds != null) {
            //Select the messages based on time passed
            const historyDate = new Date();
            historyDate.setTime(historyDate.getTime() - 20*1000);

            const dateForStatement = historyDate.toISOString();
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

