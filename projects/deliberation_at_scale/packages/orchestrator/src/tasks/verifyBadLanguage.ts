import { Helpers } from "graphile-worker";

import supabaseClient, { Message, sendBotMessage } from "../lib/supabase";
import { createVerificationFunctionCompletion } from "../lib/openai";

/**
 * This task determines whether a single message is using very difficult language.
 * If so, this message is flagged and an informal message from the moderator is sent out.
 */
export default async function badLanguage(message: Message, helpers: Helpers) {
    const { id: messageId, content, room_id: roomId } = message ?? {};

    //TODO: Add verification by openAI algorithm

    // TODO: replace the task content with the one of the actual message
    const verificationResult = await createVerificationFunctionCompletion({
        taskInstruction: `
        You are the supervisor of a discussion. You must make sure that the message below adheres to the following rules:
        - Messages may not contain insults to humans or other entities
        - Messages may not describe physical attributes of humans
        `,
        //verified,
        // not difficult example
        taskContent: `
            I like discussing with you guys!.
        `,

        // difficult example
        // taskContent: `
        //     I hate discussing with you guys!
        // `,

        // actual message content
        // taskContent: content,
    });
    const isAppropiateLanguage = verificationResult.verified;
    const unappropiateReason = verificationResult.reason;
    const unappropiateReasonToParticipants = verificationResult.moderated;

    // TMP: temporary logging statements
    console.log('Bad language verification result:');
    console.log(verificationResult);

    console.log('Moderator explaination:');
    console.log(unappropiateReasonToParticipants);

    // guard: do nothing when it is not difficult language
    if (isAppropiateLanguage || !roomId) {
        return;
    }

    helpers.logger.info(`Sending clarification message to room ${roomId} for message ${messageId}: ${unappropiateReason}`);
    helpers.logger.info(`Sending clarification message to room ${roomId} for message ${messageId}: ${unappropiateReasonToParticipants}`);

    // execute these in parallel to each other
    await Promise.allSettled([

        // track that this message has been moderated
        insertModeration(message, unappropiateReason),

        // send a message to the room with the moderators explaination about the verification
        sendBotMessage({
            content: unappropiateReasonToParticipants,
            roomId,
        }),
    ]);


}

async function insertModeration(message: Message, statement: string) {
    await supabaseClient.from("moderations").insert({
        type: 'badLanguage',
        statement,
        target_type: 'message',
        message_id: message.id,
        participant_id: message.participant_id,
        room_id: message.room_id,
    });
}
