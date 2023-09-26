import { BaseProgressionWorkerTaskPayload } from "../types";
import { getMessageContentForProgressionWorker } from "../utilities/messages";
import { createModeratedVerifyTask } from "../utilities/tasks";

export default createModeratedVerifyTask<BaseProgressionWorkerTaskPayload>({
    getTaskInstruction: async () => {
        return `
            You are the supervisor of a discussion. You must make sure that the message below adheres to the following rules:
            - If in general the language used if very difficult and hard to understand.
        `;
    },
    getTaskContent: (helpers) => {
        const { payload } = helpers;
        const content = getMessageContentForProgressionWorker(payload);

        return content;
    },
    getShouldSendBotMessage: () => false,
});
