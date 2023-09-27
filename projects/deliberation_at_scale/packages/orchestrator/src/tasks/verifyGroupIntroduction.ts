import { createModeratedVerifyTask } from "../utilities/tasks";
import { BaseProgressionWorkerTaskPayload } from "../types";
import { PARTICIPANTS_PER_ROOM } from "../config/constants";
import { getMessageContentForProgressionWorker } from "../utilities/messages";

export default createModeratedVerifyTask<BaseProgressionWorkerTaskPayload>({
    getTaskInstruction: async () => {
        return `
            ${PARTICIPANTS_PER_ROOM} participants are introducing themselves to each other.
            Have all participants introduced themselves?
        `;
    },
    getTaskContent: async (helpers) => {
        const { payload } = helpers;
        const content = await getMessageContentForProgressionWorker(payload);
        return content;
    },

    // This group introduction is handled by the enrichGroupIntroduction task
    getShouldSendBotMessage: () => false,
});
