import { Helpers } from "graphile-worker";
import dayjs from "dayjs";
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
            completed_at: dayjs().toISOString(),
            room_id: roomId,
            message_id: messageId,
            participant_id: participantId,
        });
    };

    helpers.logger.info(`Message ${messageId} was checked for safe language: ${hasFlaggedContent}`);
    await Promise.allSettled([
        storeModeration(),
        await supabaseClient
            .from("messages")
            .update({
                safe_language: !hasFlaggedContent,
            })
            .eq('id', messageId)
    ]);
}
