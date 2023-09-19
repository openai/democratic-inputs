import { createModeratedEnrichTask, getMessageContentForProgressionWorker } from "../utilities/moderatorTasks";
import { BaseProgressionWorkerTaskPayload } from "../types";
import { PARTICIPANTS_PER_ROOM } from "../config/constants";

export default createModeratedEnrichTask<BaseProgressionWorkerTaskPayload>({
    getTaskInstruction: async () => {
        return `
            You are a moderator of a discussion between ${PARTICIPANTS_PER_ROOM} participants.
            You would like to propose a consensus to the participants. Adhere to the following rules:
            - Write the consensus as a statement
            - Do not use we in the formed consensus
            - Use less than 20 words
            - Use easy to understand language
        `;
    },
    getTaskContent: (payload) => {
        const content = getMessageContentForProgressionWorker(payload);

        return content;
    },
});
