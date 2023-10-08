import dayjs, { Dayjs } from "dayjs";
import { MessageType, supabaseClient } from "../lib/supabase";
import { BaseProgressionWorkerTaskPayload, ProgressionHistoryMessageContext } from "../types";
import { getParticipantsByRoomId } from "./participants";
import { Helpers } from "graphile-worker";
import { draw } from "radash";

export interface SendMessageOptions {
    active?: boolean;
    participantId?: string;
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

export async function sendParticipantMessage(options: Omit<SendMessageOptions, 'type'>) {
    return sendMessage({
        ...options,
        type: 'chat',
    });
}

export async function sendMessage(options: SendMessageOptions) {
    const { active = true, type, roomId, content, participantId } = options;

    await supabaseClient.from("messages").insert({
        active,
        type,
        room_id: roomId,
        participant_id: participantId,
        content,
    });
}

export async function getMessageContentForProgressionWorker(payload: BaseProgressionWorkerTaskPayload) {
    const { roomId, jobKey, progressionTask } = payload;
    const messageContext = progressionTask.context?.messages;
    const [messagesResult, participantsResult] = await Promise.allSettled([
        getMessagesByContext(roomId, messageContext),
        getParticipantsByRoomId(roomId),
    ]);

    if (messagesResult.status === 'rejected' || participantsResult.status === 'rejected') {
        throw Error(`Could not get the messages or participants for the progression task with job key ${jobKey}.`);
    }

    const messages = messagesResult?.value ?? [];
    const participants = participantsResult?.value ?? [];
    const getParticipantName = (participantId: string | null) => {
        const participant = participants.find((participant) => participant.id === participantId);
        const { nick_name: name } = participant ?? {};
        return `${name} (${participantId})` ?? participantId ?? 'unknown';
    };

    const content = messages.map((message) => {
        const { content, participant_id: participantId } = message;
        const participantName = getParticipantName(participantId);

        return `Participant ${participantName}: ${content}`;
    }).join('\n');

    return content;
}

export async function getMessagesByContext(roomId: string, context?: ProgressionHistoryMessageContext) {
    const { amount, durationMs, roomStatuses } = context ?? {};
    let statement = supabaseClient
        .from("messages")
        .select()
        .in("type", ["chat", "voice"])
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });

    if (durationMs) {
        const fromDate = dayjs().subtract(durationMs, 'ms').toISOString();
        statement = statement.gte("created_at", fromDate);
    }

    if (amount) {
        statement = statement.limit(amount);
    }

    if (roomStatuses) {
        statement = statement.in("room_status_type", roomStatuses);
    }

    const messagesData = await statement;
    const messages = messagesData?.data ?? [];

    return messages;
}

export interface GetMessagesAfterOptions {
    roomId: string;
    fromDate?: Dayjs;
    limit?: number;
}

/**
 * Get all the messages that are created after a certain time.
 */
export async function getMessagesAfter(options: GetMessagesAfterOptions) {
    const { roomId, fromDate, limit = 100 } = options;
    let messageStatement = supabaseClient
        .from('messages')
        .select()
        .eq('active', true)
        .eq('room_id', roomId)
        .in('type', ['chat', 'voice'])
        .order('created_at', { ascending: false })
        .limit(limit);

    if (fromDate) {
        messageStatement = messageStatement.gte('created_at', fromDate.toISOString());
    }

    const messagesData = await messageStatement;
    const messages = messagesData?.data ?? [];

    return messages;
}

interface GetContentForHardCodedEnrichMessageOptions {
    contentOptions: string[];
}

export function getContentForHardCodedEnrichMessage(payload: GetContentForHardCodedEnrichMessageOptions) {
    const { contentOptions } = payload;
    const selectedContent = draw(contentOptions);

    if (!selectedContent) {
        return;
    }

    return selectedContent;
}

interface SendHardCodedEnrichMessage extends BaseProgressionWorkerTaskPayload {
    contentOptions: string[];
    helpers: Helpers;
}

export async function sendHardCodedEnrichMessage(options: SendHardCodedEnrichMessage) {
    const { roomId, jobKey, progressionTask, contentOptions, helpers } = options;
    const { id: progressionTaskId, workerTaskId } = progressionTask;
    const selectedContent = draw(contentOptions);

    if (!selectedContent) {
        helpers.logger.error(``);
        return;
    }

    // run inserting the moderations and sending the bot message in parallel
    await Promise.allSettled([
        supabaseClient.from("moderations").insert({
            type: progressionTaskId,
            job_key: jobKey,
            statement: `A room received a hard coded enrich message with worker task ID: ${workerTaskId}.`,
            completed_at: dayjs().toISOString(),
            result: JSON.stringify({
                selectedContent,
            }),
            target_type: 'room',
            room_id: roomId,
        }),
        sendBotMessage({
            content: selectedContent,
            roomId,
        }),
    ]);
}
