import { Helpers } from "graphile-worker";
import { isEmpty } from "radash";
import dayjs, { Dayjs } from "dayjs";

import { Json } from "../generated/database-public.types";
import { EnrichFunctionCompletionResult, VerificationFunctionCompletionResult, createEnrichFunctionCompletion, createVerificationFunctionCompletion } from "../lib/openai";
import { supabaseClient, MessageType } from "../lib/supabase";
import { BaseProgressionWorkerTaskPayload, BaseRoomWorkerTaskPayload, ProgressionHistoryMessageContext, RoomStatus } from "../types";

export interface CreateModeratorTaskOptions<PayloadType, ResultType> {
    getTaskInstruction: (payload: PayloadType) => Promise<string> | string;
    getTaskContent: (payload: PayloadType) => Promise<string> | string;
    performTask: (taskInstruction: string, taskContent: string) => Promise<ResultType> | ResultType;
    getShouldSendBotMessage?: (result: ResultType) => Promise<boolean> | boolean;
    getBotMessageContent?: (result: ResultType) => Promise<string> | string;
    onTaskCompleted?: (payload: PayloadType, result: ResultType) => Promise<void> | void;
}

type CreateVerifyTaskOptions<PayloadType> = Omit<CreateModeratorTaskOptions<PayloadType, VerificationFunctionCompletionResult>, 'performTask'>;
type CreateEnrichTaskOptions<PayloadType> = Omit<CreateModeratorTaskOptions<PayloadType, EnrichFunctionCompletionResult>, 'performTask'>;

export function createModeratedVerifyTask<PayloadType extends BaseRoomWorkerTaskPayload>(options: CreateVerifyTaskOptions<PayloadType>) {
    return createModeratorTask<PayloadType, VerificationFunctionCompletionResult>({
        performTask: async (taskInstruction, taskContent) => {
            const verificationResult = await createVerificationFunctionCompletion({
                taskInstruction,
                taskContent,
            });

            return verificationResult;
        },
        getShouldSendBotMessage: async (verificationResult: VerificationFunctionCompletionResult) => {
            const { verified } = verificationResult;
            return !verified;
        },
        getBotMessageContent: async (verificationResult: VerificationFunctionCompletionResult) => {
            const { moderatedReason } = verificationResult;
            return moderatedReason;
        },
        ...options,
    });
}

export function createModeratedEnrichTask<PayloadType extends BaseRoomWorkerTaskPayload>(options: CreateEnrichTaskOptions<PayloadType>) {
    return createModeratorTask<PayloadType, EnrichFunctionCompletionResult>({
        performTask: async (taskInstruction, taskContent) => {
            const enrichmentResult = await createEnrichFunctionCompletion({
                taskInstruction,
                taskContent,
            });

            return enrichmentResult;
        },
        getShouldSendBotMessage: async (enrichmentResult: EnrichFunctionCompletionResult) => {
            const { enrichtment } = enrichmentResult;
            return !!enrichtment;
        },
        getBotMessageContent: async (enrichmentResult: EnrichFunctionCompletionResult) => {
            const { enrichtment } = enrichmentResult;
            return enrichtment;
        },
        ...options,
    });
}

export function createModeratorTask<PayloadType extends BaseRoomWorkerTaskPayload, ResultType>(options: CreateModeratorTaskOptions<PayloadType, ResultType>) {
    return async (payload: PayloadType, helpers: Helpers) => {
        const {
            getTaskInstruction,
            getTaskContent,
            getShouldSendBotMessage = () => false,
            getBotMessageContent = () => '',
            performTask,
            onTaskCompleted,
        } = options;
        const { jobKey, roomId } = payload;

        // guard: skip task when there is no task instruction
        if (!jobKey || !roomId) {
            helpers.logger.error(`No valid job key or room ID is found for the moderator task with payload: ${payload}.`);
            return;
        }

        // get these in parallel to each other to optimize speed
        const [taskInstructionResult, taskContentResult] = await Promise.allSettled([
            getTaskInstruction(payload),
            getTaskContent(payload),
        ]);

        // guard: retry when there is no instruction or content
        if (taskInstructionResult.status === 'rejected' || taskContentResult.status === 'rejected') {
            throw Error(`Could not get the task instruction or content for the moderator task with key ${jobKey}.`);
        }

        // perform the actual verification prompt on the payload
        const taskInstruction = taskInstructionResult?.value;
        const taskContent = taskContentResult?.value?.trim();

        // guard: skip task when there is no task instruction or content
        if (isEmpty(taskInstruction) || isEmpty(taskContent)) {
            helpers.logger.error(`The task instruction or content is invalid for the moderator task with key ${jobKey}`);
            return;
        }

        const taskResult = await performTask(taskInstruction, taskContent);
        const shouldSendBotMessage = await getShouldSendBotMessage(taskResult);
        const botMessageContent = await getBotMessageContent(taskResult);

        // guard: throw error when we should send a bot message but its invalid
        if (shouldSendBotMessage && isEmpty(botMessageContent)) {
            throw Error(`The bot message content is invalid for the moderator task with key ${jobKey}, result: ${JSON.stringify(taskResult)}`);
        }

        helpers.logger.info(`The moderator task with key ${jobKey} has been completed with the following result:`);
        helpers.logger.info(JSON.stringify(taskResult, null, 2));

        // execute these in parallel to each other
        await Promise.allSettled([

            // execute the the callback when it is defined
            !!onTaskCompleted && onTaskCompleted(payload, taskResult),

            // always store the result of this verification in the database for logging purposes
            storeModerationResult({
                jobKey,
                result: (taskResult as unknown as Json),
            }),

            // send a message to the room only when there is no safe language
            shouldSendBotMessage && sendBotMessage({
                content: botMessageContent,
                roomId,
            }),
        ]);
    };
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
        return name ?? participantId ?? 'unknown';
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

export async function getTopicContentByRoomId(roomId: string) {
    const room = await getRoomById(roomId);
    const topicId = room?.topic_id;

    if (!topicId) {
        throw Error(`Could not get valid topic content for room ${roomId} because there is no topic ID.`);
    }

    const topic = await getTopicById(topicId);
    const { content } = topic ?? {};

    if (!content) {
        throw Error(`Could not get valid topic content for topic ${topicId}.`);
    }

    return content;
}

async function getParticipantsByRoomId(roomId: string) {
    const participantsData = await supabaseClient
        .from("participants")
        .select()
        .eq("room_id", roomId);

    const participants = participantsData?.data ?? [];

    return participants;
}

interface SendMessageOptions {
    active?: boolean;
    type: MessageType;
    roomId: string;
    content: string;
}

async function sendBotMessage(options: Omit<SendMessageOptions, 'type'>) {
    return sendMessage({
        ...options,
        type: 'bot',
    });
}

async function sendMessage(options: SendMessageOptions) {
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

    const { error } = await supabaseClient.from("moderations").update({
        result,
        completed_at: dayjs().toISOString(),
        message_id: messageId,
        room_id: roomId,
        participant_id: participantId,
    }).eq("job_key", jobKey);

    if (error) {
        throw Error(`Could not store moderation result due to error: ${JSON.stringify(error)}`);
    }
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

/**
 * Get x amount of moderations for a specific job key.
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
 * Get the last moderation for a certain job key.
 */
export async function getLastCompletedModerationByJobKey(jobKey: string) {
    const moderations = await getCompletedModerationsByJobKey(jobKey, 1);
    const lastModeration = moderations?.[0];

    return lastModeration;
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
        .order('created_at', { ascending: false })
        .limit(limit);

    if (fromDate) {
        messageStatement = messageStatement.gte('created_at', fromDate.toISOString());
    }

    const messagesData = await messageStatement;
    const messages = messagesData?.data ?? [];

    return messages;
}

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

export async function getTopicById(topicId: string) {
    const topicData = await supabaseClient
        .from('topics')
        .select()
        .eq('active', true)
        .eq('id', topicId)
        .limit(1);

    return topicData.data?.[0];
}