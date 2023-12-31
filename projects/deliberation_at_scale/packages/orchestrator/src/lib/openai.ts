/* eslint-disable no-console */
import { OpenAI } from "openai";
import { ONE_SECOND_MS, OPENAI_API_KEY } from "../config/constants";
import { ChatCompletionCreateParams } from "openai/resources/chat";
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions";
import { supabaseClient } from "./supabase";
import dayjs from "dayjs";

const openaiClient = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

export default openaiClient;

export type FunctionCall = OpenAI.Chat.Completions.ChatCompletionMessage.FunctionCall;
export interface FunctionCompletionOptions {
    taskInstruction: string;
    taskContent: string;
    functionSchema: ChatCompletionCreateParams.Function;
    model?: ChatCompletionCreateParamsBase['model'];
}
export interface PromptCompletionOptions {
    taskInstruction: string;
    taskContent: string;
    model?: ChatCompletionCreateParamsBase['model'];
}

export interface VerificationFunctionCompletionOptions {
    taskInstruction: string;
    taskContent: string;
}

export interface VerificationFunctionCompletionResult {
    verified: boolean;
    moderatedReason: string;
}

export interface EnrichCompletionResult {
    enrichment: string;
}

export interface EnrichFunctionCompletionOptions {
    taskInstruction: string;
    taskContent: string;
}

export async function createVerificationFunctionCompletion(options: VerificationFunctionCompletionOptions): Promise<VerificationFunctionCompletionResult> {
    const { taskInstruction, taskContent } = options;
    const functionCall = await createFunctionCompletion({
        taskInstruction,
        taskContent,
        functionSchema: {
            name: "verify_for_task_instruction",
            description: `
                Determine whether based on the instructions the provided content is valid.
            `,
            parameters: {
                type: "object",
                properties: {
                    verified: {
                        type: "boolean",
                        description: `Result of whether the provided content is verified by the instructions.`,
                    },
                    moderatedReason: {
                        type: "string",
                        description: `A short and easy to read explanation towards the participants of a discussion of why the result is verified or not.`,
                    },
                },
                required: ["verified", "moderatedReason"],
            },
        },
    });
    const parsedArguments = JSON.parse(functionCall?.arguments ?? '{}');
    const verified = !!parsedArguments?.verified;
    const moderatedReason = ((parsedArguments?.moderatedReason as string) ?? '').trim();

    return {
        verified,
        moderatedReason,
    };
}

export async function createEnrichFunctionCompletion(options: EnrichFunctionCompletionOptions): Promise<EnrichCompletionResult> {
    const { taskInstruction, taskContent } = options;
    const functionCall = await createFunctionCompletion({
        taskInstruction,
        taskContent,
        functionSchema: {
            name: "enrichment",
            description: `${taskInstruction}`,
            parameters: {
                type: "object",
                properties: {
                    enrichment: {
                        type: "string",
                        description: `Communication of the moderator towards the participants during a discussion.`,
                    },
                },
                required: ["enrichment"],
            },
        },
    });
    const parsedArguments = JSON.parse(functionCall?.arguments ?? '{}');
    const enrichment = (parsedArguments?.enrichment as string) ?? '';

    return {
        enrichment,
    };
}

export async function createEnrichPromptCompletion(options: EnrichFunctionCompletionOptions): Promise<EnrichCompletionResult> {
    const { taskInstruction, taskContent } = options;
    const enrichment = await createPromptCompletion({
        taskInstruction,
        taskContent
    });
    const validEnrichment = enrichment ?? '';

    return {
        enrichment: validEnrichment,
    };
}

export async function createFunctionCompletion(options: FunctionCompletionOptions): Promise<FunctionCall | undefined>  {
    const {
        taskInstruction,
        taskContent,
        functionSchema,
        model = 'gpt-3.5-turbo-0613',
    } = options;
    const startTime = dayjs();
    const waitingMessageInterval = setInterval(() => {
        const passedTimeMs = dayjs().diff(startTime, 'ms');
        console.info(`Waiting on function completion (${passedTimeMs}): ${taskInstruction.trim().slice(0, 100)}`);
    }, ONE_SECOND_MS * 3);

    const [completionResult, completionLogResult] = await Promise.allSettled([

        // perform the structured completion
        openaiClient.chat.completions.create({
            model,
            messages : [{
                role: 'user',
                content: taskInstruction,
            }, {
                role: 'user',
                content: taskContent,
            }],
            functions: [functionSchema],
        }),

        // log the prompt to the database for transparency on decision making and debugging
        supabaseClient.from('completions').insert({
            prompt: `
                Task instruction:
                ${taskInstruction}

                Task content:
                ${taskContent}
            `,
            model: { name: model },
            type: 'gpt',
        }),
    ]);

    // disable debugging
    clearInterval(waitingMessageInterval);

    if (completionResult.status !== 'fulfilled') {
        console.error(`Failed to get a valid function completion: ${completionResult.reason}`);
        return;
    }

    if (completionLogResult.status !== 'fulfilled') {
        console.error(`Failed to log the function completion: ${completionLogResult.reason}`);
        return;
    }

    const completion = completionResult.value.choices?.[0];
    const functionCall = completion?.message?.function_call;

    return functionCall;
}

export async function createPromptCompletion(options: PromptCompletionOptions): Promise<string | undefined>  {
    const {
        taskInstruction,
        taskContent,
        model = 'gpt-4-0613',
    } = options;
    const startTime = dayjs();
    const waitingMessageInterval = setInterval(() => {
        const passedTimeMs = dayjs().diff(startTime, 'ms');
        console.info(`Waiting on prompt completion (${passedTimeMs}): ${taskInstruction.trim().slice(0, 100)}`);
    }, ONE_SECOND_MS * 3);
    const prompt = `
        Task instruction:
        ${taskInstruction}

        Task content:
        ${taskContent}
    `;
    const [completionResult, completionLogResult] = await Promise.allSettled([

        // perform the structured completion
        openaiClient.chat.completions.create({
            model,
            messages: [{
                role: 'user',
                content: taskInstruction,
            },{
                role: 'user',
                content: taskContent,
            }]
        }),

        // log the prompt to the database for transparency on decision making and debugging
        supabaseClient.from('completions').insert({
            prompt,
            model: { name: model },
            type: 'gpt',
        }),
    ]);

    // disable debugging
    clearInterval(waitingMessageInterval);

    if (completionResult.status !== 'fulfilled') {
        console.error(`Failed to get a valid prompt completion: ${completionResult.reason}`);
        return;
    }

    if (completionLogResult.status !== 'fulfilled') {
        console.error(`Failed to log the prompt completion: ${completionLogResult.reason}`);
        return;
    }

    const completion = completionResult.value.choices?.[0].message.content ?? undefined;

    return completion;
}
