import { Helpers } from "graphile-worker";
import supabaseClient, { Message, sendBotMessage } from "../lib/supabase";
import openaiClient from "../lib/openai";


export interface enrichModeratorMessageStimulateConsensusPayload {
    message: Message;
    // roomId: string;
    // messageId: string;

}

/**
 * This task sends out an enrichtment about consensus forming
 */

export default async function enrichModeratorMessageStimulateConsensus(payload: enrichModeratorMessageStimulateConsensusPayload, helpers: Helpers) {
    const { message } = payload;


    // TODO: replace the task content with the one of the actual message
    const enrichment = await openaiClient.completions.create({
        temperature: 0.8,
        messages: [
            {
                role: 'user',
                content: `You are a moderator of a discussion between 3 participants.
                In the discussion, no consensus between the participants has been found yet, because of the following reasons:
                No consensus has been found because
                Formulate a message of max. 20 words to guide the discussion towards a consensus
                Message: ${message.content}
            `},
        ],
        model: 'gpt-4',
    });

    console.log(enrichment);

    const enrichtmentResult = enrichment.choices[0];

    if (!enrichtmentResult) {
        console.log('No enrichtment');
        return null;
    }

    return enrichtmentResult;
}
