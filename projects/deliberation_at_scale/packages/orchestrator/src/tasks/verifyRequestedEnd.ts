import { createModeratedVerifyTask } from "../utilities/tasks";
import { BaseProgressionWorkerTaskPayload } from "../types";
import { PARTICIPANTS_PER_ROOM } from "../config/constants";
import { getMessageContentForProgressionWorker } from "../utilities/messages";

export default createModeratedVerifyTask<BaseProgressionWorkerTaskPayload>({
    getTaskInstruction: async () => {
        return `
            ${PARTICIPANTS_PER_ROOM} participants are in a discussion and you need to check whether they want to end the discussion
            using words like 'we would like to stop' or 'we want to join another conversation'.
            Make sure at least ${Math.max(PARTICIPANTS_PER_ROOM - 1, 1)} participants have expressed this desire.
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
