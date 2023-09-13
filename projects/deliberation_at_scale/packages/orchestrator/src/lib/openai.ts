import { OpenAI } from "openai";
import { DEFAULT_FUNCTION_COMPLETION_MODEL_NAME, OPENAI_API_KEY } from "../constants";
import { ChatCompletionCreateParams } from "openai/resources/chat";
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions";
import supabaseClient from "./supabase";

const openaiClient = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

export default openaiClient;

export interface FunctionCompletionOptions {
    prompt: string;
    functionSchema: ChatCompletionCreateParams.Function;
    model?: ChatCompletionCreateParamsBase['model'];
}

export function createLoggedFunctionCompletion(options: FunctionCompletionOptions) {
    const {
        prompt,
        functionSchema,
        model = 'gpt-4-0613',
    } = options;
    openaiClient.chat.completions.create({
        model,
        messages : [{
            role: 'user',
            content: prompt,
        }],
        functions: [functionSchema],
    });

    // log the prompt in supabase
    const completionLogResult = await supabaseClient.from('completions').insert({
        prompt,
        model: { name: model },
        type: 'gpt',
    });
}
