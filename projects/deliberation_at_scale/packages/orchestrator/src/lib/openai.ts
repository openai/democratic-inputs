import { OpenAI } from "openai";
import { OPENAI_API_KEY } from "../constants";
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
    systemReason: string;
    moderatedReason: string;
}

export interface EnrichFunctionCompletionResult {
    enrichtment: string;
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
            description: `Determine whether: ${taskInstruction}`,
            parameters: {
                type: "object",
                properties: {
                    verified: {
                        type: "boolean",
                        description: `Result of whether this is the case: ${taskInstruction}.`,
                    },
                    systemReason: {
                        type: "string",
                        description: `An explanation of why the result is verified or not.`,
                    },
                    moderatedReason: {
                        type: "string",
                        description: `An explanation from the moderator towards the participants of why the result is verified or not.`,
                    }
                },
                required: ["verified", "reason", "moderated"],
            },
        },
    });
    const parsedArguments = JSON.parse(functionCall?.arguments ?? '{}');
    const verified = !!parsedArguments?.verified;
    const systemReason = (parsedArguments?.systemReason as string) ?? '';
    const moderatedReason = (parsedArguments?.moderatedReason as string) ?? '';

    return {
        verified,
        systemReason,
        moderatedReason
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
                    enrichtment: {
                        type: "string",
                        description: `Communication of the moderator towards the participants during a discussion.`,
                    }
                },
                required: ["enrichtment"],
            },
        },
    });
    const parsedArguments = JSON.parse(functionCall?.arguments ?? '{}');
    const enrichtment = (parsedArguments?.enrichtment as string) ?? '';

    return {
        enrichtment,
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
                role: 'system',
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

    // guard: check statuses of promises
    if (completionResult.status !== 'fulfilled' || completionLogResult.status !== 'fulfilled') {
        return;
    }

    const completion = completionResult.value.choices?.[0];
    const functionCall = completion?.message?.function_call;

    return functionCall;
}
