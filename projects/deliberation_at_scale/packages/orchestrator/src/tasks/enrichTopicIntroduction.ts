import { createModeratedEnrichTask, getTopicContentByRoomId } from "../utilities/moderatorTasks";
import { BaseProgressionWorkerTaskPayload } from "../types";
import { PARTICIPANTS_PER_ROOM } from "../config/constants";

export default createModeratedEnrichTask<BaseProgressionWorkerTaskPayload>({
    getTaskInstruction: async () => {
        return `
            You are a moderator of a discussion between ${PARTICIPANTS_PER_ROOM} participants.
            You would like to introduce the topic mentioned below to the participants in a nifty way.
        `;
    },
    getTaskContent: (payload) => {
        const { roomId } = payload;
        const topicContent = getTopicContentByRoomId(roomId);

        return topicContent;
    },
});
