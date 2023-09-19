import { createModeratedEnrichTask, getMessageContentForProgressionWorker } from "../utilities/moderatorTasks";
import { BaseProgressionWorkerTaskPayload } from "../types";
import { PARTICIPANTS_PER_ROOM } from "../config/constants";

export default createModeratedEnrichTask<BaseProgressionWorkerTaskPayload>({
    getTaskInstruction: async () => {
        return `
            You are a moderator of a conversation between ${PARTICIPANTS_PER_ROOM} participants.
            You will give a final reminder to the participants to be respectful and helpful in the conversation in 3 short bullet point points in a verly lightly nifty way.
        `;
    },
    getTaskContent: (payload) => {
        const content = getMessageContentForProgressionWorker(payload);

        return content;
    },
});
