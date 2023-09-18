import { supabaseClient } from "../lib/supabase";
import { BaseMessageWorkerTaskPayload } from "../types";
import { createModeratedVerifyTask } from "../utilities/moderatorTasks";

/**
 * This task determines whether a single message is using safe language.
 * If there are things found like harrasment or insults, the message will be moderated.
 */
export default createModeratedVerifyTask<BaseMessageWorkerTaskPayload>({
    getTaskInstruction: () => {
        return `
            You are the supervisor of a discussion. You must make sure that the message below adheres to the following rules:
            - Messages may not contain insults to humans or other entities
            - Messages may not describe physical attributes of humans
        `;
    },
    getTaskContent: (payload) => {
        return payload.message.content;
    },
    onTaskCompleted: async (payload, taskResult) => {
        const { message } = payload;
        const { id: messageId } = message;
        const { verified } = taskResult;

        // guard: only update the message when it is not verified
        if (verified) {
            return;
        }

        // update the message to be moderated
        await supabaseClient
            .from("messages")
            .update({
                content: "This message has been flagged as inappropiate.",
            })
            .eq('id', messageId);
    },
});
