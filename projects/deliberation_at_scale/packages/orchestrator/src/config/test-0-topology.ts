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
                    maxAttempts: 1,
                    executionType: 'alwaysBeforeVerification',
                    waitFor: true,
                    context: {
                        messages: {
                            roomStatuses: ["group_intro"]
                        },
                    },
                },
                {
                    id: 'groupIntro-enrichGroupIntroduction',
                    workerTaskId: 'enrichGroupIntroduction',
                    maxAttempts: 3,
                    executionType: 'onNotVerified',
                    cooldown: {
                        startDelayMs: 90 * ONE_SECOND_MS,
                        durationMs: 60 * ONE_SECOND_MS,
                    },
                    context: {
                        messages: {
                            roomStatuses: ["group_intro"]
                        },
                    },
                },
            ]
        },
        {
            id: 'topicIntro',
            roomStatus: 'topic_intro',
            enrichments: [
                {
                    id: 'topicIntro-enrichTopicIntroduction',
                    workerTaskId: 'enrichTopicIntroduction',
                    maxAttempts: 1,
                    executionType: 'alwaysBeforeVerification',
                    waitFor: true,
                },
            ]
        },
        {
            id: 'end',
            roomStatus: 'end',
            verifications: [],
            enrichments: [
                {
                    id: 'close-enrichClosure',
                    workerTaskId: 'enrichClosure',
                    maxAttempts: 1,
                    executionType: 'alwaysBeforeVerification',
                    context: {
                        messages: {
                            roomStatuses: ['informed', 'debate', 'results', 'close'],
                        }
                    }
                },
            ],
        },
    ],
};
