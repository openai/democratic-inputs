import { Helpers } from "graphile-worker";
import { isEmpty, draw } from "radash";
import dayjs from "dayjs";

import { Json } from "../generated/database-public.types";
import { EnrichCompletionResult, VerificationFunctionCompletionResult, createEnrichFunctionCompletion, createEnrichPromptCompletion, createVerificationFunctionCompletion } from "../lib/openai";
import { supabaseClient, OutcomeType, Moderation, Outcome } from "../lib/supabase";
import { BaseProgressionWorkerTaskPayload, BaseRoomWorkerTaskPayload } from "../types";
import { getDefaultOutsomeSourcesMessageIds, storeOutcome } from "./outcomes";
import { sendBotMessage } from "./messages";
import { storeModerationResult } from "./moderations";
import { PRINT_JOBKEY } from "../config/constants";

export interface BaseTaskHelpers<PayloadType> {
    helpers: Helpers;
    payload: PayloadType;
}

export interface PerformTaskHelpers<PayloadType> extends BaseTaskHelpers<PayloadType> {
    taskInstruction: string;
    taskContent: string;
}

export interface ResultTaskHelpers<PayloadType, ResultType> extends PerformTaskHelpers<PayloadType> {
    result: ResultType;
}

export interface CreateModeratorTaskOptions<PayloadType, ResultType> {
    getTaskInstruction: (helpers: BaseTaskHelpers<PayloadType>) => Promise<string> | string;
    getTaskContent: (helpers: BaseTaskHelpers<PayloadType>) => Promise<string> | string;
    performTask: (helpers: PerformTaskHelpers<PayloadType>) => Promise<ResultType> | ResultType;
    getShouldSendBotMessage?: (helpers: ResultTaskHelpers<PayloadType, ResultType>) => Promise<boolean> | boolean;
    getBotMessageContent?: (helpers: ResultTaskHelpers<PayloadType, ResultType>) => Promise<string> | string;
    onTaskCompleted?: (helpers: ResultTaskHelpers<PayloadType, ResultType>) => Promise<void> | void;
    getShouldStoreOutcome?: (helpers: ResultTaskHelpers<PayloadType, ResultType>) => Promise<boolean> | boolean;
    getOutcomeContent?: (helpers: ResultTaskHelpers<PayloadType, ResultType>) => Promise<string> | string;
    getOutcomeType?: (helpers: ResultTaskHelpers<PayloadType, ResultType>) => Promise<OutcomeType> | OutcomeType;
    getOutcomeSourcesMessageIds?: (helpers: ResultTaskHelpers<PayloadType, ResultType>) => Promise<string[]> | string[];
}

type CreateVerifyTaskOptions<PayloadType> = Omit<CreateModeratorTaskOptions<PayloadType, VerificationFunctionCompletionResult>, 'performTask'>;
type CreateEnrichTaskOptions<PayloadType> = Omit<CreateModeratorTaskOptions<PayloadType, EnrichCompletionResult>, 'performTask'>;

export interface ModeratorTaskTuple {
    moderation?: Moderation;
    outcome?: Outcome;
}


export function createModeratedVerifyTask<PayloadType extends BaseRoomWorkerTaskPayload>(options: CreateVerifyTaskOptions<PayloadType>) {
    return createModeratorTask<PayloadType, VerificationFunctionCompletionResult>({
        performTask: async (helpers) => {
            const { taskInstruction, taskContent } = helpers;
            const verificationResult = await createVerificationFunctionCompletion({
                taskInstruction,
                taskContent,
            });

            return verificationResult;
        },
        getShouldSendBotMessage: async (helpers) => {
            const { result } = helpers;
            const { verified } = result;
            return !verified;
        },
        getBotMessageContent: async (helpers) => {
            const { result } = helpers;
            const { moderatedReason } = result;
            return moderatedReason;
        },
        ...options,
    });
}

export function createProgressionVerifyTask<PayloadType extends BaseProgressionWorkerTaskPayload>(options: CreateVerifyTaskOptions<PayloadType>) {
    return createModeratedVerifyTask<PayloadType>({
        getOutcomeSourcesMessageIds: getDefaultOutsomeSourcesMessageIds,
        getOutcomeContent: (helpers) => {
            return helpers.result.moderatedReason;
        },
        ...options,
    });
}

export function createModeratedEnrichTask<PayloadType extends BaseProgressionWorkerTaskPayload>(options: CreateEnrichTaskOptions<PayloadType>) {
    return createModeratorTask<PayloadType, EnrichCompletionResult>({
        performTask: async (helpers) => {
            const { taskInstruction, taskContent } = helpers;
            const enrichmentResult = await createEnrichFunctionCompletion({
                taskInstruction,
                taskContent,
            });

            return enrichmentResult;
        },
        getShouldSendBotMessage: async (helpers) => {
            const { result } = helpers;
            const { enrichment } = result;
            return !!enrichment;
        },
        getBotMessageContent: async (helpers) => {
            const { result } = helpers;
            const { enrichment } = result;
            return enrichment;
        },
        getOutcomeSourcesMessageIds: getDefaultOutsomeSourcesMessageIds,
        getOutcomeContent: (helpers) => {
            return helpers.result.enrichment;
        },
        ...options,
    });
}

export function createModeratedEnrichPromptTask<PayloadType extends BaseProgressionWorkerTaskPayload>(options: CreateEnrichTaskOptions<PayloadType>) {
    return createModeratorTask<PayloadType, EnrichCompletionResult>({
        performTask: async (helpers) => {
            const { taskInstruction, taskContent } = helpers;
            const enrichmentResult = await createEnrichPromptCompletion({
                taskInstruction,
                taskContent,
            });

            return enrichmentResult;
        },
        getShouldSendBotMessage: async (helpers) => {
            const { result } = helpers;
            const { enrichment } = result;
            return !!enrichment;
        },
        getBotMessageContent: async (helpers) => {
            const { result } = helpers;
            const { enrichment } = result;
            return enrichment;
        },
        getOutcomeSourcesMessageIds: getDefaultOutsomeSourcesMessageIds,
        getOutcomeContent: (helpers) => {
            return helpers.result.enrichment;
        },
        ...options,
    });
}

export function createModeratorTask<PayloadType extends BaseRoomWorkerTaskPayload, ResultType>(options: CreateModeratorTaskOptions<PayloadType, ResultType>) {
    return async (payload: PayloadType, helpers: Helpers): Promise<ModeratorTaskTuple> => {
        const {
            getTaskInstruction,
            getTaskContent,
            getShouldSendBotMessage = () => false,
            getBotMessageContent = () => '',
            performTask,
            onTaskCompleted,
            getShouldStoreOutcome = () => false,
            getOutcomeSourcesMessageIds,
            getOutcomeContent,
            getOutcomeType,
        } = options;
        const { jobKey, roomId } = payload;
        const baseTaskHelpers: BaseTaskHelpers<PayloadType> = {
            helpers,
            payload,
        };

        // guard: skip task when there is no task instruction
        if (!jobKey || !roomId) {
            helpers.logger.error(`No valid job key or room ID is found for the moderator task with payload: ${payload}.`);
            return {};
        }

        // get these in parallel to each other to optimize speed
        const [taskInstructionResult, taskContentResult] = await Promise.allSettled([
            getTaskInstruction(baseTaskHelpers),
            getTaskContent(baseTaskHelpers),
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
            return {};
        }

        const performTaskHelpers: PerformTaskHelpers<PayloadType> = {
            ...baseTaskHelpers,
            taskInstruction,
            taskContent,
        };
        const taskResult = await performTask(performTaskHelpers);
        const resultTaskHelpers: ResultTaskHelpers<PayloadType, ResultType> = {
            ...performTaskHelpers,
            result: taskResult,
        };
        const shouldSendBotMessage = await getShouldSendBotMessage(resultTaskHelpers);
        const botMessageContent = await getBotMessageContent(resultTaskHelpers);
        const shouldStoreOutcome = await getShouldStoreOutcome(resultTaskHelpers);

        // guard: throw error when we should send a bot message but its invalid
        if (shouldSendBotMessage && isEmpty(botMessageContent)) {
            throw Error(`The bot message content is invalid for the moderator task with key ${jobKey}, result: ${JSON.stringify(taskResult)}`);
        }

        helpers.logger.info(`The moderator task with key ${jobKey} has been completed with the following result:`);
        helpers.logger.info(JSON.stringify(taskResult, null, 2));

        // execute these in parallel to each other
        const results = await Promise.allSettled([

            // always store the result of this verification in the database for logging purposes
            storeModerationResult({
                jobKey,
                result: (taskResult as unknown as Json),
            }),

            // store the outcome only when requested
            shouldStoreOutcome && storeOutcome({
                helpers: resultTaskHelpers,
                getOutcomeSourcesMessageIds,
                getOutcomeContent,
                getOutcomeType,
            }),

            // execute the the callback when it is defined
            !!onTaskCompleted && onTaskCompleted(resultTaskHelpers),

            // send a message to the room only when there is no safe language
            shouldSendBotMessage && sendBotMessage({
                content: PRINT_JOBKEY ? `${jobKey}: ${botMessageContent}` : botMessageContent,
                roomId,
            }),
        ]);
        const moderationResult = results?.[0];
        const outcomeResult = results?.[1];
        const moderation = moderationResult.status === 'fulfilled' ? moderationResult?.value : undefined;
        const outcome = outcomeResult.status === 'fulfilled' && outcomeResult?.value !== false ? outcomeResult?.value : undefined;

        return {
            moderation,
            outcome,
        };
    };
}

interface GetContentForHardCodedEnrichMessageOptions {
    contentOptions: string[];
}

export function getContentForHardCodedEnrichMessage(payload: GetContentForHardCodedEnrichMessageOptions) {
    const { contentOptions } = payload;
    const selectedContent = draw(contentOptions);

    return selectedContent;
}

interface SendHardCodedEnrichMessage extends BaseProgressionWorkerTaskPayload {
    contentOptions: string[],
    helpers: Helpers
}

export async function sendHardCodedEnrichMessage(options: SendHardCodedEnrichMessage) {
    const { roomId, jobKey, progressionTask, contentOptions } = options;
    const { id: progressionTaskId, workerTaskId } = progressionTask;
    const selectedContent = getContentForHardCodedEnrichMessage({ contentOptions });

    if (!selectedContent) {
        return {};
    }

    // run inserting the moderations and sending the bot message in parallel
    const results = await Promise.allSettled([
        sendBotMessage({
            content: selectedContent,
            roomId,
        }),
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
        }).select(),
    ]);

    const moderationResult = results?.[1];
    const moderation = moderationResult.status === 'fulfilled' ? moderationResult?.value.data?.[0] : undefined;

    return {
        moderation,
    };
}
