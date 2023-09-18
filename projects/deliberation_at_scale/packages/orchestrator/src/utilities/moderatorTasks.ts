import { Helpers } from "graphile-worker";
import { isEmpty } from "radash";

import { Json } from "../generated/database-public.types";
import { EnrichFunctionCompletionResult, VerificationFunctionCompletionResult, createEnrichFunctionCompletion, createVerificationFunctionCompletion } from "../lib/openai";
import { storeModerationResult, sendBotMessage, Message } from "../lib/supabase";
import { BaseProgressionWorkerTaskPayload, BaseRoomWorkerTaskPayload, ProgressionHistoryMessageContext } from "../types";

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

        helpers.logger.info(`The moderator task with key ${jobKey} has been completed with the following result: ${JSON.stringify(taskResult)}`);

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
    const { roomId, progressionTask } = payload;
    const messageContext = progressionTask.context?.messages;
    const messages = await getMessagesByContext(roomId, messageContext);
    const content = messages.map((message) => {
        const { content, participant_id: participantId } = message;

        return `Participant ${participantId}: ${content}`;
    }).join('\n');

    return content;
}

export async function getMessagesByContext(roomId: string, context?: ProgressionHistoryMessageContext) {

    // TODO: get the messages from the database
    return [] as Message[];
}

export async function getTopicContentByRoomId(roomId: string) {

    // TODO: get topic from the database
    return `Students are not allowed to use AI technology for their exams.`;
}
