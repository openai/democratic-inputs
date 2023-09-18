import { PARTICIPANTS_PER_ROOM } from "../config/constants";
import { BaseProgressionWorkerTaskPayload } from "../types";
import { createModeratedVerifyTask, getMessageContentForProgressionWorker } from "../utilities/moderatorTasks";

/**
 * This task verifies whether the conversation is still about the topic for the past x amount of messages.
 * The amount of message history is provided via the payload.
 */
export default createModeratedVerifyTask<BaseProgressionWorkerTaskPayload>({
    getTaskInstruction: async () => {
        return `
            You are a moderator of a discussion between ${PARTICIPANTS_PER_ROOM} participants.

            You have to evaluate the evaluate the emotional wellbeing of the participants according to the following rules:
            - Every participant should be able to express their opinion
        `;
    },
    getTaskContent: (payload) => {
        const content = getMessageContentForProgressionWorker(payload);

        return content;
    },
    getShouldSendBotMessage: () => false,
});
