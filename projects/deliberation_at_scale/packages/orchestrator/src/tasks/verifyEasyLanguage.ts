import { BaseProgressionWorkerTaskPayload } from "../types";
import { createModeratedVerifyTask, getMessageContentForProgressionWorker } from "../utilities/moderatorTasks";

export default createModeratedVerifyTask<BaseProgressionWorkerTaskPayload>({
    getTaskInstruction: async () => {
        return `
            You are the supervisor of a discussion. You must make sure that the message below adheres to the following rules:
            - If messages are too long or too complex in nature

            Always make sure you give the proper reasons of why it is verified or not.
        `;
    },
    getTaskContent: (payload) => {
        const content = getMessageContentForProgressionWorker(payload);

        return content;
    },
});
