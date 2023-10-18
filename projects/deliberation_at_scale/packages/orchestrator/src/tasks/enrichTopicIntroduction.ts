import { ONE_SECOND_MS } from "../config/constants";
import { BaseProgressionWorkerTaskPayload } from "../types";
import { getParticipantsByRoomId } from "../utilities/participants";
import { createModeratedEnrichPromptTask } from "../utilities/tasks";
import { getTopicContentByRoomId } from "../utilities/topics";
import { waitFor } from "../utilities/time";
import { sendBotMessage } from "../utilities/messages";
import { t } from "@lingui/macro";

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
            content: t`
                I hope you have all had the time to introduce yourselves.
            `,
        });
        await waitFor(ONE_SECOND_MS * 6);
        await sendBotMessage({
            roomId,
            content: t`
                The topic of today's conversation is: **${topicContent}**
            `,
        });
        await waitFor(ONE_SECOND_MS * 4);
        await sendBotMessage({
            roomId,
            content: t`
                To help with the conversation, you will receive a statement and the chance to vote on whether you agree, disagree or if you think it should be skipped.
            `,
        });
        await waitFor(ONE_SECOND_MS * 5);
        await sendBotMessage({
            roomId,
            content: t`
                You can discuss the statements through the video call with your fellow participants and when you have made up your mind, you can vote.
            `,
        });
        await waitFor(ONE_SECOND_MS * 5);
        await sendBotMessage({
            roomId,
            content: t`
                Do you want to create your **own statements**? You can do that at any time by **typing in the chat**.
            `,
        });
        await waitFor(ONE_SECOND_MS * 6);
        await sendBotMessage({
            roomId,
            content: t`
                If anything seems broken, stuck or frozen, please **refresh the page**.
            `,
        });
        await waitFor(ONE_SECOND_MS * 6);
        await sendBotMessage({
            roomId,
            content: t`
                Alright! Are you ready? Let's start with the first statement.
            `,
        });

    }
});
