import { BaseProgressionWorkerTaskPayload } from "../types";
import { getMessageContentForProgressionWorker } from "../utilities/messages";
import { PARTICIPANTS_PER_ROOM } from "../config/constants";
import { createModeratedEnrichTask } from "../utilities/tasks";

export default createModeratedEnrichTask<BaseProgressionWorkerTaskPayload>({
    getTaskInstruction: async () => {
        return `
            You are a moderator of a discussion between ${PARTICIPANTS_PER_ROOM} participants.
            In the discussion, no consensus between the participants has been found yet.

            Guide the discussion towards a consenus. Formulate a message of max. 20 words.
        `;
    },
    getTaskContent: (helpers) => {
        const { payload } = helpers;
        const content = getMessageContentForProgressionWorker(payload);

        return content;
    },
});
