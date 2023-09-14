import { Helpers } from "graphile-worker";

import supabaseClient, { Message, sendBotMessage } from "../lib/supabase";
import { createVerificationFunctionCompletion } from "../lib/openai";

/**
 * This task determines whether a single message is using very difficult language.
 * If so, this message is flagged and an informal message from the moderator is sent out.
 */
export default async function difficultLanguage(message: Message, helpers: Helpers) {
    const { id: messageId, content, room_id: roomId } = message ?? {};

    // TODO: replace the task content with the one of the actual message
    const verificationResult = await createVerificationFunctionCompletion({
        taskInstruction: `
            You are the supervisor of a discussion. You must make sure that the message below adheres to the following rules:
            - Messages may not contain words that are difficult to understand
        `,
        //verified,
        // not difficult example
        // taskContent: `
        //     I hope I'm speaking clearly to you because my opinion is not only very valid, but I think you might misunderstand me.
        // `,

        // difficult example
        taskContent: `
            I think you are trying to be too extravagant with your outragous opinions, if you would be a fine sir I would've thought differently of you!
        `,

        // actual message content
        // taskContent: content,
    });
    const isUnderstandableLanguage = verificationResult.verified;
    const clarificationReason = verificationResult.reason;
    const clarificationReasonToParticipants = verificationResult.moderated;

    // TMP: temporary logging statements
    console.log('Difficult language verification result:');
    console.log(verificationResult);

    console.log('Moderator explaination:');
    console.log(clarificationReasonToParticipants);

    // guard: do nothing when it is not difficult language
    if (isUnderstandableLanguage || !roomId) {
        return;
    }

    helpers.logger.info(`Sending clarification message to room ${roomId} for message ${messageId}: ${clarificationReason}`);
    helpers.logger.info(`Sending clarification message to room ${roomId} for message ${messageId}: ${clarificationReasonToParticipants}`);

    // execute these in parallel to each other
    await Promise.allSettled([

        // track that this message has been moderated
        insertClarification(message, clarificationReason),

        // send a message to the room with the moderators explaination about the verification
        sendBotMessage({
            content: clarificationReasonToParticipants,
            roomId,
        }),
    ]);


}

async function insertClarification(message: Message, statement: string) {
    await supabaseClient.from("moderations").insert({
        type: 'clarification',
        statement,
        target_type: 'message',
        message_id: message.id,
        participant_id: message.participant_id,
    });
}
