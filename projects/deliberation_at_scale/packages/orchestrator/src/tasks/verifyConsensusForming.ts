import { BaseProgressionWorkerTaskPayload } from "../types";
import { PARTICIPANTS_PER_ROOM } from "../config/constants";
import { getMessageContentForProgressionWorker } from "../utilities/messages";
import { createModeratedVerifyTask } from "../utilities/tasks";
import { getTopicContentByRoomId } from "../utilities/topics";

/**
 * This task verifies whether the conversation is still about the topic for the past x amount of messages.
 * The amount of message history is provided via the payload.
 */
export default createModeratedVerifyTask<BaseProgressionWorkerTaskPayload>({
    getTaskInstruction: async (helpers) => {
        const { payload } = helpers;
        const { roomId } = payload;
        const topicContent = await getTopicContentByRoomId(roomId);

        // return `
        //     You are a moderator of a discussion between ${PARTICIPANTS_PER_ROOM} participants on the topic:
        //     "${topicContent}"?

        //     You have to evaluate whether they have found a consensus on the topic.
        // `;
        return `
            You are a moderator of a discussion between ${PARTICIPANTS_PER_ROOM} participants on the topic:
            "${topicContent}"?

            You have to evaluate whether it is possible to make a summary of the discussion.
        `;
    },
    getTaskContent: (helpers) => {
        const { payload } = helpers;
        const content = getMessageContentForProgressionWorker(payload);

        return content;
    },
    getShouldSendBotMessage: () => false,
});
