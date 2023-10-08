import { isEmpty } from "radash";

import { supabaseClient } from "../lib/supabase";
import { BaseMessageWorkerTaskPayload } from "../types";
import { createModeratedVerifyTask } from "../utilities/tasks";

export default createModeratedVerifyTask<BaseMessageWorkerTaskPayload>({
    getTaskInstruction: () => {
        return `
            You are the supervisor of a discussion. You must make sure that the message below adheres to the following rules:
            - If messages are too long or too complex in nature
            - Contain words that are difficult to understand

            Always make sure you give the proper reasons of why it is verified or not.
        `;
    },
    getTaskContent: (helpers) => {
        const { payload } = helpers;
        return payload.message.content;
    },
    onTaskCompleted: async (helpers) => {
        const { payload, result } = helpers;
        const { message } = payload;

        const { verified, moderatedReason } = result;
        const { id: messageId } = message;

        // guard: only update the message when it is not verified
        if (isEmpty(moderatedReason)) {
            return;
        }

        // update the message to be moderated
        helpers.helpers.logger.info(`Message ${messageId} was checked for easy language: ${verified}`);
        await supabaseClient
            .from("messages")
            .update({
                easy_language: verified,
            })
            .eq('id', messageId);
    },
    getShouldSendBotMessage: () => false,
});
