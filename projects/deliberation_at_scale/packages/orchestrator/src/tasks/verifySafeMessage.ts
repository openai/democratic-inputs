import { Helpers } from "graphile-worker";
import { supabaseClient } from "../lib/supabase";
import { BaseMessageWorkerTaskPayload } from "../types";
import openaiClient from "../lib/openai";

/**
 * This task determines whether a single message is using safe language.
 * If there are things found like harrasment or insults, the message will be moderated.
 */
export default async function verifySafeMessage(payload: BaseMessageWorkerTaskPayload, helpers: Helpers) {
    const { message, roomId, jobKey } = payload;
    const { id: messageId, participant_id: participantId, content } = message;
    const moderationResult = await openaiClient.moderations.create({
        input: content,
        model: 'text-moderation-stable',
    });
    const { results } = moderationResult;
    const hasFlaggedContent = results.some((result) => {
        return result.flagged;
    });
    const storeModeration = async() => {
        await supabaseClient.from("moderations").insert({
            type: 'verifySafeMessage',
            job_key: jobKey,
            statement: `The message was ${hasFlaggedContent ? 'flagged' : 'not flagged'}.`,
            target_type: 'message',
            result: JSON.stringify(results),
            room_id: roomId,
            message_id: messageId,
            participant_id: participantId,
        });
    };

    // guard: skip when there is no flagged content
    if (!hasFlaggedContent) {
        await storeModeration();
        return;
    }

    // flag the message
    helpers.logger.info(`Message ${messageId} has flagged content: ${content}`);
    await Promise.allSettled([
        storeModeration(),
        await supabaseClient
            .from("messages")
            .update({
                content: "This message has been flagged as inappropiate.",
            })
            .eq('id', messageId)
    ]);
}
