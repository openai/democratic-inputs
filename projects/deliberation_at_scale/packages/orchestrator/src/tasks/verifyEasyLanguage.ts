import { BaseProgressionWorkerTaskPayload } from "../types";
import { createModeratedVerifyTask, getMessageContentForProgressionWorker } from "../utilities/moderatorTasks";

export default createModeratedVerifyTask<BaseProgressionWorkerTaskPayload>({
    getTaskInstruction: async () => {
        return `
            You are the supervisor of a discussion. You must make sure that the message below adheres to the following rules:
            - If in general the language used if very difficult and hard to understand.
        `;
    },
    getTaskContent: (payload) => {
        const content = getMessageContentForProgressionWorker(payload);

        return content;
    },
});
