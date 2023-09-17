import { Helpers, quickAddJob } from "graphile-worker";
import supabaseClient, { getTopic, selectMessages } from "../lib/supabase";
import openaiClient, { createVerificationFunctionCompletion } from "../lib/openai";
import { CreateChatCompletionRequestMessage } from "openai/resources/chat";
import { Database } from "../generated/database.types";

type Message = Database["public"]["Tables"]["messages"]["Row"]

/**
 * Run this task at most every n seconds
 */
const TASK_INTERVAL_SECONDS = 10;
const historyAmountMessages = 10;

/**
 * This task retrieves all messages since its last execution and attempts to
 * summarize them using GPT.
 */
export default async function verifyEmotionalWellbeing(
    lastRun: string | null,
    helpers: Helpers
) {  

    // Retrieve all messages from supabase
    const messages = await selectMessages({
        historyAmountMessages,
    });

    // GUARD: If there are no messages, reschedule the job

    if (messages === null) {
        helpers.logger.info("Mesassages undefined.");
        return reschedule(lastRun);
    }

    if (messages.length === 0) {
        helpers.logger.info("No messages found.");
        return reschedule(lastRun);
    }

    const { id: messageId, content, room_id: roomId, } = messages[0] ?? {};

    const verificationResult = await createVerificationFunctionCompletion({
        taskInstruction: `
        You are a moderator of a discussion between three participants.

        You have to evaluate the evaluate the emotional wellbeing of the participants according to the following rules:
        - Every participant should be able to express their opinion

        `,
        //verified,
        // not difficult example
        taskContent:    
        
        JSON.stringify(
            messages.map(
                (message) =>
                    ({
                        participant: message.participant_id,
                        content: message.content,
                    })
            )
        )
    });
    const isEmotionalWellbeing = verificationResult.verified;
    const emotionalWellbeingReason = verificationResult.reason;

    // TMP: temporary logging statements
    console.log('Consensus verification result:');
    console.log(isEmotionalWellbeing);

    console.log('Reason:');
    console.log(emotionalWellbeingReason);

    // guard: do nothing when it is not difficult language
    if (isEmotionalWellbeing || !roomId) {
        return;
    }

    helpers.logger.info(`Sending clarification message to room ${roomId} for message ${messageId}: ${emotionalWellbeingReason}`);

    // execute these in parallel to each other
    await Promise.allSettled([

        // track that this message has been moderated
        insertModeration(messages, emotionalWellbeingReason),

        // send a message to the room with the moderators explaination about the verification
        // sendBotMessage({
        //     content: unappropiateReasonToParticipants,
        //     roomId,
        // }),
    ]);


    return reschedule(lastRun);
}

/**
 * Reschedule this job for the next iteration
 */
function reschedule(initialDate: string | null) {
    // Re-schedule this job n seconds after the last invocation
    quickAddJob({}, "verifyEmotionalWellbeing", new Date(), {
        runAt: new Date(
            (initialDate ? new Date(initialDate) : new Date()).getTime() +
      1_000 * TASK_INTERVAL_SECONDS
        ),
        jobKey: "verifyEmotionalWellbeing",
        jobKeyMode: "preserve_run_at",
    });
}

async function insertModeration(message: Message, statement: string) {
    await supabaseClient.from("moderations").insert({
        type: 'emotionalWellbeing',
        statement,
        target_type: 'message',
        message_id: message.id,
        participant_id: message.participant_id,
        room_id: message.room_id,
    });
}
