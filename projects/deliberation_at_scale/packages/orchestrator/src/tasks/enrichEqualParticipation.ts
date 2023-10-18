import { BaseProgressionWorkerTaskPayload } from "../types";
import { getMessageContentForProgressionWorker } from "../utilities/messages";
import { PARTICIPANTS_PER_ROOM } from "../config/constants";
import { createModeratedEnrichTask } from "../utilities/tasks";

export default createModeratedEnrichTask<BaseProgressionWorkerTaskPayload>({
    getTaskInstruction: async () => {
        return `
            You are a moderator of a discussion between ${PARTICIPANTS_PER_ROOM} participants.
            You want to make sure that the participants are equally involved in the discussion.

            Guide the discussion by formulating a message of max 20 words. Do this in a stimulating way.
        `;
    },
    getTaskContent: (helpers) => {
        const { payload } = helpers;
        const content = getMessageContentForProgressionWorker(payload);

        return content;
    },
});
