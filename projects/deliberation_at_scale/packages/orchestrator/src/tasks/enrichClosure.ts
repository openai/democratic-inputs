import { createModeratedEnrichTask, getMessageContentForProgressionWorker } from "../utilities/moderatorTasks";
import { BaseProgressionWorkerTaskPayload } from "../types";
import { PARTICIPANTS_PER_ROOM } from "../config/constants";

export default createModeratedEnrichTask<BaseProgressionWorkerTaskPayload>({
    getTaskInstruction: async () => {
        return `
            You are a moderator of a discussion between ${PARTICIPANTS_PER_ROOM} participants.
            The discussion has come to an end and you would like to say some closing words about the result of the discussion.
        `;
    },
    getTaskContent: (payload) => {
        const content = getMessageContentForProgressionWorker(payload);

        return content;
    },
});
