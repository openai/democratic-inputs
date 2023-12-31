import { getMessageContentForProgressionWorker } from "../utilities/messages";
import { getTopicContentByRoomId } from "../utilities/topics";
import { PARTICIPANTS_PER_ROOM } from "../config/constants";
import { BaseProgressionWorkerTaskPayload } from "../types";
import { createModeratedVerifyTask } from "../utilities/tasks";

/**
 * This task verifies whether the conversation is still about the topic for the past x amount of messages.
 * The amount of message history is provided via the payload.
 */
export default createModeratedVerifyTask<BaseProgressionWorkerTaskPayload>({
    getTaskInstruction: async (helpers) => {
        const { payload } = helpers;
        const { roomId } = payload;
        const topicContent = await getTopicContentByRoomId(roomId);

        return `
            You are a moderator of a discussion between ${PARTICIPANTS_PER_ROOM} participants on the topic:
            "${topicContent}"?

            You have to evaluate if their is enough content in the discussion according to the following rules:
            - Every participants should have provided multiple arguments about their perspective
            - It does not matter if there were some flagged messages
        `;
    },
    getTaskContent: (helpers) => {
        const { payload } = helpers;
        const content = getMessageContentForProgressionWorker(payload);

        return content;
    },
    getShouldSendBotMessage: () => false,
});
