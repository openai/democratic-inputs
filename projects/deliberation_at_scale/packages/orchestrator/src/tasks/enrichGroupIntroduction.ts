import { createModeratedEnrichTask } from "../utilities/tasks";
import { BaseProgressionWorkerTaskPayload } from "../types";
import { PARTICIPANTS_PER_ROOM } from "../config/constants";

//TODO: Add variable to provide participant names to prompt

export default createModeratedEnrichTask<BaseProgressionWorkerTaskPayload>({
    getTaskInstruction: async () => {
        return `
        You are a moderator of a discussion between ${PARTICIPANTS_PER_ROOM} participants.

        All ${PARTICIPANTS_PER_ROOM} participants need to introduce themselves. Ask the participants that have not yet to introduce themselves.
        Do not greet the participants.
        `;
    },
    getTaskContent: async () => {
        return 'unknown';
    },
});
