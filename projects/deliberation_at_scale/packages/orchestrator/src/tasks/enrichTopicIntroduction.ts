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
    getShouldSendBotMessage: () => false, // TMP: disable for now
    getBotMessageContent: async (helpers) => {
        const { result } = helpers;
        const { enrichment } = result;

        return enrichment;
    },
    onTaskCompleted: async (helpers) => {
        const roomId = helpers.payload.roomId;
        const topicContent = await getTopicContentByRoomId(roomId);
        await waitFor(ONE_SECOND_MS * 10);
        await sendBotMessage({
            roomId,
            content: `
                I hope you had the time to introduce yourselves to each other. Let's get started!
            `,
        });
        await waitFor(ONE_SECOND_MS * 5);
        await sendBotMessage({
            roomId,
            content: `
                Throughout the conversation you will be asked discuss and vote on statements related to the topic: **${topicContent}**
            `,
        });
        await waitFor(ONE_SECOND_MS * 8);
        await sendBotMessage({
            roomId,
            content: `
                If you want to have an open discussion and create new statements yourself, you can do so at any time by typing in the chat. I will try to summarize them for you automatically.
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
