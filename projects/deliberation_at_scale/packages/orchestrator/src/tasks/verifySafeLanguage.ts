import { sendBotMessage, storeModerationResult } from "../lib/supabase";
import { createVerificationFunctionCompletion } from "../lib/openai";
import { BaseMessageWorkerTaskPayload } from "src/types";

/**
 * This task determines whether a single message is using safe language.
 * If there are things found like harrasment or insults, the message will be moderated.
 */
export default async function verifySafeLanguage(payload: BaseMessageWorkerTaskPayload) {
    const { jobKey, message } = payload;
    const { content, room_id: roomId } = message ?? {};

    // guard: check if the payload is valid
    if (!message || !roomId) {
        throw Error(`The job ${jobKey} has an invalid payload for the verifySafeLanguage task.`);
    }

    // perform the actual verification on the message found in the payload
    const verificationResult = await createVerificationFunctionCompletion({
        taskInstruction: `
            You are the supervisor of a discussion. You must make sure that the message below adheres to the following rules:
            - Messages may not contain insults to humans or other entities
            - Messages may not describe physical attributes of humans
        `,
        taskContent: content,
    });
    const { verified: isSafeLanguage, moderatedReason } = verificationResult;

    // execute these in parallel to each other
    await Promise.allSettled([

        // always store the result of this verification in the database for logging purposes
        await storeModerationResult({
            jobKey,
            result: verificationResult,
        }),

        // send a message to the room only when there is no safe language
        !isSafeLanguage && sendBotMessage({
            content: moderatedReason,
            roomId,
        }),
    ]);
}
