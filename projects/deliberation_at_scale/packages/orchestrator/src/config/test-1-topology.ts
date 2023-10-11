import { ProgressionTopology } from "../types";
import { ONE_SECOND_MS } from "./constants";

const INTRODUCE_CONVERSATION_AFTER_MS = 10 * ONE_SECOND_MS;
const INTRODUCE_TOPIC_AFTER_MS = 45 * ONE_SECOND_MS;
const START_STATEMENTS_AFTER_MS = 45 * ONE_SECOND_MS;
const ALLOW_END_REQUEST_AFTER_MS = 10* 60 * ONE_SECOND_MS;

export const progressionTopology: Readonly<ProgressionTopology> = {
    layers: [
        {
            id: 'groupIntro',
            roomStatus: 'group_intro',
            enrichments: [
                {
                    id: 'groupIntro-enrichModeratorIntroduction',
                    workerTaskId: 'enrichModeratorIntroduction',
                    minAttempts: 1,
                    maxAttempts: 1,
                    executionType: 'alwaysBeforeVerification',
                    waitFor: true,
                    cooldown: {
                        startDelayMs: INTRODUCE_CONVERSATION_AFTER_MS,
                    },
                    context: {
                        messages: {
                            roomStatuses: ["group_intro"]
                        },
                    },
                },
            ],
        },
        {
            id: 'topicIntro',
            roomStatus: 'topic_intro',
            enrichments: [
                {
                    id: 'topicIntro-enrichTopicIntroduction',
                    workerTaskId: 'enrichTopicIntroduction',
                    minAttempts: 1,
                    maxAttempts: 1,
                    executionType: 'alwaysBeforeVerification',
                    waitFor: true,
                    cooldown: {
                        startDelayMs: INTRODUCE_TOPIC_AFTER_MS,
                    },
                },
            ],
        },
        {
            id: 'results',
            roomStatus: 'results',
            verifications: [
                {
                    id: 'results-verifyRequestedEnd',
                    workerTaskId: 'verifyRequestedEnd',
                    cooldown: {
                        startDelayMs: ALLOW_END_REQUEST_AFTER_MS,
                        durationMs: 15 * ONE_SECOND_MS,
                    },
                }
            ],
            enrichments: [
                {
                    id: 'results-enrichVoteCheck',
                    workerTaskId: 'enrichVoteCheck',
                    minAttempts: 1,
                    executionType: 'alwaysBeforeVerification',
                    cooldown: {
                        startDelayMs: START_STATEMENTS_AFTER_MS,
                    },
                },
            ],
        },
        {
            id: 'end',
            roomStatus: 'end',
            verifications: [],
            enrichments: [
                {
                    id: 'close-enrichClosure',
                    workerTaskId: 'enrichClosure',
                    minAttempts: 1,
                    maxAttempts: 1,
                    executionType: 'alwaysBeforeVerification',
                },
            ],
        },
    ],
};
