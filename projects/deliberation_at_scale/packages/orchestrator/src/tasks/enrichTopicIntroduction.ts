import { createModeratedEnrichTask, getTopicContentByRoomId } from "../utilities/moderatorTasks";
import { BaseProgressionWorkerTaskPayload } from "../types";
import { PARTICIPANTS_PER_ROOM } from "../config/constants";

export default createModeratedEnrichTask<BaseProgressionWorkerTaskPayload>({
    getTaskInstruction: async () => {

        return `
            You are a moderator of a conversation between ${PARTICIPANTS_PER_ROOM} participants. You as a moderator and the participants have already introduced themselves, so no additional greeting is necessary.
            You are at a point to kickstart the conversation by introducing the topic mentioned below to the participants in a short and sweet way.
            After the topic is presented you'll ask if there is anyone who wants to share their first thoughts on the topic.
            Limit your answer to three sentences.
        `;
    },
    getTaskContent: async (payload) => {
        const { roomId } = payload;
        const topicContent = await getTopicContentByRoomId(roomId);
        return topicContent;
    },
});
