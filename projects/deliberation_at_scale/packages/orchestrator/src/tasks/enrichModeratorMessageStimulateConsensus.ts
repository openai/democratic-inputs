import { Helpers } from "graphile-worker";
import { Message, sendBotMessage } from "../lib/supabase";
import { createEnrichFunctionCompletion } from "../lib/openai";

/**
 * This task determines whether a single message is using very difficult language.
 * If so, this message is flagged and an informal message from the moderator is sent out.
 */
export default async function difficultLanguage(message: Message, helpers: Helpers) {
    const { id: messageId, content, room_id: roomId } = message ?? {};

    // TODO: replace the task content with the one of the actual message
    const enrichResult = await createEnrichFunctionCompletion({
        taskInstruction: `
            You are a moderator of a discussion between 3 participants.
            In the discussion, no consensus between the participants has been found yet, because of the following reasons:
            No consensus has been found because
            Formulate a message of max. 20 words to guide the discussion towards a consensus
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

    const clarificationReasonToParticipants = enrichResult.enriched;

    // TMP: temporary logging statements
    console.log('Enrich result:');
    console.log(enrichResult);

    // guard: do nothing when it is not difficult language
    if (isUnderstandableLanguage || !roomId) {
        return;
    }


    helpers.logger.info(`Sending clarification message to room ${roomId} for message ${messageId}: ${clarificationReasonToParticipants}`);

    // execute these in parallel to each other
    await Promise.allSettled([
        // track that this message has been moderated
        // send a message to the room with the moderators explaination about the verification
        sendBotMessage({
            content: clarificationReasonToParticipants,
            roomId,
        }),
    ]);
}
