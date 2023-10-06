import { ONE_SECOND_MS } from "../config/constants";
import { BaseProgressionWorkerTaskPayload } from "../types";
import { getParticipantsByRoomId } from "../utilities/participants";
import { createModeratedEnrichPromptTask } from "../utilities/tasks";
import { getTopicContentByRoomId } from "../utilities/topics";
import { waitFor } from "../utilities/time";
import { sendBotMessage } from "../utilities/messages";

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
    onTaskCompleted: async (helpers) => {
        const roomId = helpers.payload.roomId;
        await waitFor(ONE_SECOND_MS * 10);
        await sendBotMessage({
            roomId,
            content: `
                If you like, you can type out what you think about the topic. If everyone in your video call types something, we will try to synthesise all your views into one new statement that you can vote on. As soon as everyone has voted, we will find you a new statement to discuss!
            `,
        });
        await waitFor(ONE_SECOND_MS * 4);
        await sendBotMessage({
            roomId,
            content: `
                By taking all the statements which people agree with, we can analyse them to find common ground! After the conversation has ended, we will send you an overview of what we have found.
            `,
        });
        await waitFor(ONE_SECOND_MS * 3);
        await sendBotMessage({
            roomId,
            content: `
                Good luck and have fun!
            `,
        });

    }
});
