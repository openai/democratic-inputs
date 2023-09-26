import { getMessageContentForProgressionWorker } from "../utilities/messages";
import { BaseProgressionWorkerTaskPayload } from "../types";
import { createModeratedVerifyTask } from "../utilities/tasks";

/**
 * This task verifies whether the conversation is still about the topic for the past x amount of messages.
 * The amount of message history is provided via the payload.
 */
export default createModeratedVerifyTask<BaseProgressionWorkerTaskPayload>({
    getTaskInstruction: async () => {
        return `
            You are the supervisor of a discussion. You must make sure that the message below adheres to the following rules:
            - Messages may not contain insults to humans or other entities
            - Messages may not describe physical attributes of humans
        `;
    },
    getTaskContent: (helpers) => {
        const { payload } = helpers;
        const content = getMessageContentForProgressionWorker(payload);

        return content;
    },
});
