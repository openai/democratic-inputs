import { createModeratedVerifyTask, getMessageContentForProgressionWorker } from "../utilities/moderatorTasks";
import { BaseProgressionWorkerTaskPayload } from "../types";

export default createModeratedVerifyTask<BaseProgressionWorkerTaskPayload>({
    getTaskInstruction: async () => {
        return `
            You are a moderator of a discussion between three participants.
            Is the conversation mentioned below a balanced conversation whre everyone has said a similar amount of said what they think?
        `;
    },
    getTaskContent: (helpers) => {
        const { payload } = helpers;
        const content = getMessageContentForProgressionWorker(payload);

        return content;
    },
    getShouldSendBotMessage: () => false,
});
