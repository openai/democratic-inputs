import { Helpers, quickAddJob } from "graphile-worker";
import supabaseClient, { Message, sendBotMessage, selectMessages } from "../lib/supabase";
import openaiClient from "../lib/openai";

const historyAmountSeconds = 30;

export interface enrichModeratorMessageStimulateConsensusPayload {
    message: Message;
    lastRun: string | null,
    helpers: Helpers
    // roomId: string;
    // messageId: string;

}

/**
 * This task sends out an enrichtment about consensus forming
 */

export default async function enrichModeratorMessageStimulateConsensus(payload: enrichModeratorMessageStimulateConsensusPayload, helpers: Helpers) {
    const { message, lastRun } = payload;

    console.log("ik ben hier");
    // Retrieve messages from supabase
    const messages = await selectMessages(historyAmountSeconds);

    // GUARD: If there are no messages, reschedule the job
    if (messages != null) {
        if (messages.length === 0 ) {
            helpers.logger.info("No messages found.");
            return reschedule(lastRun);
        }
    }

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
            ...messages.map(
                (message) =>
                    ({
                        role: "user",
                        content: message.content,
                    } as CreateChatCompletionRequestMessage)
            ),
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

const TASK_INTERVAL_SECONDS = 30;

function reschedule(initialDate: string | null) {
    // Re-schedule this job n seconds after the last invocation
    quickAddJob({}, "enoughContent", new Date(), {
        runAt: new Date(
            (initialDate ? new Date(initialDate) : new Date()).getTime() +
      1_000 * TASK_INTERVAL_SECONDS
        ),
        jobKey: "enoughContent",
        jobKeyMode: "preserve_run_at",
    });
}
