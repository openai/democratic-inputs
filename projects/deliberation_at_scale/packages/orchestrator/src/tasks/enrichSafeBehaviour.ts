import { createModeratedEnrichTask, getMessageContentForProgressionWorker } from "../utilities/moderatorTasks";
import { BaseProgressionWorkerTaskPayload } from "../types";
import { PARTICIPANTS_PER_ROOM } from "../config/constants";

export default createModeratedEnrichTask<BaseProgressionWorkerTaskPayload>({
    getTaskInstruction: () => {
        return `
            You are a moderator of a conversation between ${PARTICIPANTS_PER_ROOM} participants.
            Tell the participants to be respectful and helpful in the conversation in a verly lightly nifty way.
            Do not greet the participants.
            Only use max 20 words.
        `;
    },
    getTaskContent: async (payload) => {
        const content = await getMessageContentForProgressionWorker(payload);

        return content;
    },
});
