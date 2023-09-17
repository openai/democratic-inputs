import { Helpers } from "graphile-worker";
import { selectMessages } from "../lib/supabase";
import { createVerificationFunctionCompletion } from "../lib/openai";
import { BaseProgressionWorkerTaskPayload } from "src/types";

/**
 * This task retrieves all messages since its last execution and attempts to
 * summarize them using GPT.
 */
export default async function verifyOffTopic(payload: BaseProgressionWorkerTaskPayload, helpers: Helpers) {
    const messages = await selectMessages({
        historyAmountMessages,
    });

    const { id: messageId, content, room_id: roomId, } = messages[0] ?? {};

    //Enable as soon as topic_id is enabled in database
    //const topic = getTopic(roomId);

    //Temporary
    const topic = "Students are not allowed to use AI technology for their exams";

    const verificationResult = await createVerificationFunctionCompletion({
        taskInstruction: `
            You are a moderator of a discussion between three participants on the topic:
            "${topic}"?

            Is their conversation still about the topic?
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
    const isOnTopic = verificationResult.verified;
    const onTopicReason = verificationResult.reason;

    // guard: do nothing when it is not difficult language
    if (isOnTopic || !roomId) {
        return;
    }

    // execute these in parallel to each other
    await Promise.allSettled([

        // track that this message has been moderated
        insertModeration(messages, onTopicReason),

        // send a message to the room with the moderators explaination about the verification
        sendBotMessage({
            content: unappropiateReasonToParticipants,
            roomId,
        }),
    ]);
}
