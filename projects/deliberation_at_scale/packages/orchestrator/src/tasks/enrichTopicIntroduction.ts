import { createModeratedEnrichPromptTask, getTopicContentByRoomId, getParticipantsByRoomId } from "../utilities/moderatorTasks";
import { BaseProgressionWorkerTaskPayload } from "../types";

export default createModeratedEnrichPromptTask<BaseProgressionWorkerTaskPayload>({
    getTaskInstruction: async (helpers) => {
        const { payload } = helpers;
        const { roomId } = payload;
        
        const participants = await getParticipantsByRoomId(roomId);
        const participantsNicknames = JSON.stringify(participants.map((participant) => participant.nick_name));

        return `
            You are a moderator of a conversation.
            The participants just introduced themselves. Thank the participants for introducing themselves.
            Introduce the topic mentioned below to the participants.
            After you presented the topic ask one of the participants: ${participantsNicknames} to share their first thoughts on the topic.

            Do not greet the participants.
        `;
    },
    getTaskContent: async (helpers) => {
        const { payload } = helpers;
        const { roomId } = payload;
        const topicContent = await getTopicContentByRoomId(roomId);

        return topicContent;
    },
    getBotMessageContent: async (helpers) => {
        const { result } = helpers;
        const { enrichment } = result;

        return enrichment;
    },
});
