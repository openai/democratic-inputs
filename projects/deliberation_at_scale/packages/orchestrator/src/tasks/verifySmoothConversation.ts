import { BaseProgressionWorkerTaskPayload } from "../types";
import { createModeratedVerifyTask, getMessageContentForProgressionWorker } from "../utilities/moderatorTasks";
import { PARTICIPANTS_PER_ROOM } from "../config/constants";

/**
 * This task verifies whether the conversation is still smooth. No long pauses etc.
 * The amount of message history is provided via the payload.
 */
export default createModeratedVerifyTask<BaseProgressionWorkerTaskPayload>({
    getTaskInstruction: async () => {
        return `
            You are a moderator of a discussion between ${PARTICIPANTS_PER_ROOM} participants on the topic:
            
            It the conversation fluent, or are the participants having trouble keeping the conversation going?
        `;
    },
    getTaskContent: (helpers) => {
        const { payload } = helpers;
        const content = getMessageContentForProgressionWorker(payload);

        return content;
    },
    getShouldSendBotMessage: () => false,
});
