import { BaseProgressionWorkerTaskPayload } from "../types";
import { getMessageContentForProgressionWorker, sendBotMessage } from "../utilities/messages";
import { ONE_SECOND_MS, PARTICIPANTS_PER_ROOM } from "../config/constants";
import { createModeratedEnrichTask } from "../utilities/tasks";
import { waitFor } from "../utilities/time";

export default createModeratedEnrichTask<BaseProgressionWorkerTaskPayload>({
    getTaskInstruction: async () => {
        return `
            You are a moderator of a discussion between ${PARTICIPANTS_PER_ROOM} participants.
            The discussion has come to an end and you would like to say some closing words about the result of the discussion. And thank the participants for their participation.

            You answer should be max 3 sentences.
        `;
    },
    getTaskContent: (helpers) => {
        const { payload } = helpers;
        const content = getMessageContentForProgressionWorker(payload);

        return content;
    },
    getShouldSendBotMessage: () => false,
    onTaskCompleted: async (helpers) => {
        const roomId = helpers.payload.roomId;
        const enrichtment = helpers.result.enrichment;

        await waitFor(ONE_SECOND_MS * 3);
        await sendBotMessage({
            roomId,
            content: enrichtment,
        });

        await waitFor(ONE_SECOND_MS * 3);
        await sendBotMessage({
            roomId,
            content: `This discussion has now come to an end. You can now say good-bye to each other and hopefully see you with a next round!`
        });
    },
});
