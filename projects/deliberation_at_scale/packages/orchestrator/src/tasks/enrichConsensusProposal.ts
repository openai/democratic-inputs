import { PARTICIPANTS_PER_ROOM } from "../config/constants";
import { BaseProgressionWorkerTaskPayload } from "../types";
import { getMessageContentForProgressionWorker, getContentForHardCodedEnrichMessage } from "../utilities/messages";
import { createModeratedEnrichPromptTask } from "../utilities/tasks";

export default createModeratedEnrichPromptTask<BaseProgressionWorkerTaskPayload>({
    getTaskInstruction: async () => {
        return `
        You are a democratic summarisation bot. You will receive some comments made by the ${PARTICIPANTS_PER_ROOM} participants of a conversation about a difficult topic. These people do not know each other and may have very different views. Do not bias towards any particular person or viewpoint. Using only the comments, create a synthesising, standalone, normative statement that captures the values of each participant and the nuance of what they have shared. Make sure the statement is short and to the point (less than two sentences). When formulating the statement, follow these rules:
            1. Don't use metaphors or similes. Say it how it is.
            2. Never use a long word where a short one works.
            3. If it is possible to cut a word out, cut it.
            4. Never use the passive where you can use the active.
            5. Never use a foreign phrase, a scientific word, or a jargon word if there exists an everyday equivalent.
            6. Break any of these rules if following them would feel strange or uncanny.
        `;
    },
    getTaskContent: (helpers) => {
        const { payload } = helpers;
        const content = getMessageContentForProgressionWorker(payload);

        return content;
    },
    getBotMessageContent: async (helpers) => {
        const { result } = helpers;
        const { enrichment: consensus } = result;
        const contentOptions = [
            `
            A summary was found:
            `,
            `
            The summary is:
            `,
            `
            We found a summary:
            `,
            `
            A possible summary is:
            `,
        ];

        const selectedOption = await getContentForHardCodedEnrichMessage({contentOptions});

        return `${selectedOption} **${consensus}**`;

    },
    getShouldStoreOutcome: () => true,
    getOutcomeType: () => 'consensus',
});

