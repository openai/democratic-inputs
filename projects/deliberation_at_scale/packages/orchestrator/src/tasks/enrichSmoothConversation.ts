import { createModeratedEnrichTask, getMessageContentForProgressionWorker } from "../utilities/moderatorTasks";
import { BaseProgressionWorkerTaskPayload } from "../types";
import { PARTICIPANTS_PER_ROOM } from "../config/constants";

export default createModeratedEnrichTask<BaseProgressionWorkerTaskPayload>({
    getTaskInstruction: () => {
        return `
            You are a moderator of a conversation between ${PARTICIPANTS_PER_ROOM} participants.
            The conversation is not going very smoothly.
            Stimulate the participants to discuss by asking a question directed to the participants.
            Use max 20 words.
        `;
    },
    getTaskContent: async (helpers) => {
        const { payload } = helpers;
        const content = await getMessageContentForProgressionWorker(payload);

        return content;
    },
});