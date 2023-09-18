import { BaseMessageWorkerTaskPayload } from "../types";
import { createModeratedVerifyTask } from "../utilities/moderatorTasks";

export default createModeratedVerifyTask<BaseMessageWorkerTaskPayload>({
    getTaskInstruction: () => {
        return `
            You are the supervisor of a discussion. You must make sure that the message below adheres to the following rules:
            - If messages are too long or too complex in nature

            Always make sure you give the proper reasons of why it is verified or not.
        `;
    },
    getTaskContent: (payload) => {
        return payload.message.content;
    },
});
