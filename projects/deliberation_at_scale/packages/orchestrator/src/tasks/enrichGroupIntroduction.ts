import { createModeratedEnrichTask, getMessageContentForProgressionWorker } from "../utilities/moderatorTasks";
import { BaseProgressionWorkerTaskPayload } from "../types";
import { PARTICIPANTS_PER_ROOM } from "../config/constants";

const DURATION_PARTICIPANT_INTRODUCTION = 20;

export default createModeratedEnrichTask<BaseProgressionWorkerTaskPayload>({
    getTaskInstruction: async () => {
        return `
            You are a moderator of a conversation between ${PARTICIPANTS_PER_ROOM} participants.
            You will say the following things listed below. You will say each thing in a seperate sentence, in a short way.
            - You welcome everyone with a short greeting.
            - You introduce yourself very briefly as a moderator of the conversation.
            - You say that before the conversation starts, that you will take a quick moment to let everyone introduce themselves and in a verly lightly nifty way
            - You suggest a brief ${DURATION_PARTICIPANT_INTRODUCTION}-second introduction from each participant and in a verly lightly nifty way
            - You suggest an order of who goes first, second and last, and ask the person on the first place to kick things off and in a verly lightly nifty way
        `;
    },
    getTaskContent: (payload) => {
        const content = getMessageContentForProgressionWorker(payload);

        return content;
    },
});
