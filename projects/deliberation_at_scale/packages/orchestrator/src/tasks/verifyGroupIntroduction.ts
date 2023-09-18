import { createModeratedVerifyTask, getMessageContentForProgressionWorker } from "../utilities/moderatorTasks";
import { BaseProgressionWorkerTaskPayload } from "../types";

export default createModeratedVerifyTask<BaseProgressionWorkerTaskPayload>({
    getTaskInstruction: async () => {
        return `
            Three participants are introducing themselves to each other.
            Have all participants finished introducing themselves??
        `;
    },
    getTaskContent: (payload) => {
        const content = getMessageContentForProgressionWorker(payload);

        return content;
    },

    // This group introduction is handled by the enrichGroupIntroduction task
    getShouldSendBotMessage: () => false,
});
