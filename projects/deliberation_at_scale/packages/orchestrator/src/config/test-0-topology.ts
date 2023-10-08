import { ProgressionTopology } from "../types";
import { ONE_SECOND_MS } from "./constants";

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
                        startDelayMs: 5 * ONE_SECOND_MS,
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
                        startDelayMs: 20 * ONE_SECOND_MS,
                    },
                },
            ],
        },
        {
            id: 'results',
            roomStatus: 'results',
            verifications: [
                {
                    id: 'results-verifyConsensusForming',
                    workerTaskId: 'verifyConsensusForming',
                    cooldown: {
                        startDelayMs: 60 * ONE_SECOND_MS,
                        durationMs: 10 * ONE_SECOND_MS,
                    },
                }
            ],
            enrichments: [
                {
                    id: 'results-enrichConsensusProposal',
                    workerTaskId: 'enrichConsensusProposal',
                    minAttempts: 1,
                    conditions: [{
                        progressionTaskId: 'results-verifyConsensusForming',
                        isVerified: true,
                    }],
                    executionType: 'alwaysBeforeVerification',
                    cooldown: {
                        startDelayMs: 10 * ONE_SECOND_MS,
                        durationMs: 20 * ONE_SECOND_MS,
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
                    cooldown: {
                        startDelayMs: 30 * ONE_SECOND_MS,
                    },
                },
            ],
        },
    ],
};
