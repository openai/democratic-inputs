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

export async function selectMessages(payload: selectMessagesPayload): Promise< Array<Message>| null> {
    // Retrieve all messages from supabase
    const { historyAllMessages, historyAmountMessages, historyAmountSeconds, historySpecifiedLayers  } = payload;
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
            const getHistoryTimestamp = new Date(Date.now() - 20 * 1000);
            statement = statement.gt("created_at", getHistoryTimestamp);
        }

        if (historyAmountMessages != null) {
            //Select the messages based on time passed
            statement = statement.order("created_at", {ascending: false}).limit(historyAmountMessages);
        }
    }

    const messages = await statement;

    const messagesResult = messages.data;

    // GUARD: Throw when we receive an error
    if (messages.error) {
        throw messages.error;
    }

    console.log("testing messages", messages);

    return messagesResult;
}

