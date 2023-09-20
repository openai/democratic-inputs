import { OpenAI } from "openai";
import { OPENAI_API_KEY } from "../config/constants";
import { ChatCompletionCreateParams } from "openai/resources/chat";
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions";
import { supabaseClient } from "./supabase";

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

export interface VerificationFunctionCompletionOptions {
    taskInstruction: string;
    taskContent: string;
}

export interface VerificationFunctionCompletionResult {
    verified: boolean;
    moderatedReason: string;
}

export interface EnrichFunctionCompletionResult {
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
            name: "is_verified",
            description: `
                Determine whether the content is verified or not while including a reason for moderation.

                Follow these instructions:
                ${taskInstruction}
            `,
            parameters: {
                type: "object",
                properties: {
                    verified: {
                        type: "boolean",
                        description: `Result of whether this is the case: ${taskInstruction}.`,
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
    const moderatedReason = (parsedArguments?.moderatedReason as string) ?? '';

    return {
        verified,
        moderatedReason,
    };
}

export async function createEnrichFunctionCompletion(options: EnrichFunctionCompletionOptions): Promise<EnrichFunctionCompletionResult> {
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

export async function createFunctionCompletion(options: FunctionCompletionOptions): Promise<FunctionCall | undefined>  {
    const {
        taskInstruction,
        taskContent,
        functionSchema,
        model = 'gpt-4-0613',
    } = options;

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
