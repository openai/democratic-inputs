import { Helpers, quickAddJob } from "graphile-worker";
import supabaseClient, { getTopic, selectMessages } from "../lib/supabase";
import openaiClient, { createVerificationFunctionCompletion } from "../lib/openai";
import { Database } from "../generated/database.types";

type Message = Database["public"]["Tables"]["messages"]["Row"]

/**
 * Run this task at most every n seconds
 */
const TASK_INTERVAL_SECONDS = 10;
const historyAmountMessages = 3;

/**
 * This task retrieves all messages since its last execution and attempts to
 * summarize them using GPT.
 */
export default async function verifyEnoughContent(
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

    //Enable as soon as topic_id is enabled in database
    //const topic = getTopic(roomId);

    //Temporary
    const topic = "Students are not allowed to use AI technology for their exams";

    const verificationResult = await createVerificationFunctionCompletion({
        taskInstruction: `
        You are a moderator of a discussion between three participants on the topic:
        "${topic}"?

        You have to evaluate if their is enough content in the discussion according to the following rules:
        - Every participants should have provided multiple arguments about their perspective

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
    const isEnoughContent = verificationResult.verified;
    const enoughContentReason = verificationResult.reason;

    // TMP: temporary logging statements
    console.log('Consensus verification result:');
    console.log(isEnoughContent);

    console.log('Reason:');
    console.log(enoughContentReason);

    // guard: do nothing when it is not difficult language
    if (isEnoughContent || !roomId) {
        return;
    }

    helpers.logger.info(`Sending clarification message to room ${roomId} for message ${messageId}: ${enoughContentReason}`);

    // execute these in parallel to each other
    await Promise.allSettled([

        // track that this message has been moderated
        insertModeration(messages, enoughContentReason),

        // send a message to the room with the moderators explaination about the verification
        // sendBotMessage({
        //     content: unappropiateReasonToParticipants,
        //     roomId,
        // }),
    ]);


    return reschedule(lastRun);
}
