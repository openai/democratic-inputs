import { ProgressionTopology } from "../types";
import { ONE_SECOND_MS } from "./constants";

export const progressionTopology: Readonly<ProgressionTopology> = {
    layers: [
        {
            id: 'groupIntro',
            roomStatus: 'group_intro',
            verifications: [
                {
                    id: 'groupIntro-verifyGroupIntroduction',
                    workerTaskId: 'verifyGroupIntroduction',
                    maxAttempts: 3,
                    cooldown: {
                        minMessageAmount: 1,
                        // maxMessageAmoun: 0,
                        durationMs: 15 * ONE_SECOND_MS,
                    },
                    context: {
                        messages: {
                            roomStatuses: ["group_intro"]
                        },
                    },
                }
            ],
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
                    maxAttempts: 10,
                    executionType: 'alwaysBeforeVerification',
                    waitFor: true,
                },
            ]
        },
        {
            id: 'safe',
            roomStatus: 'safe',
            verifications: [
                {
                    id: 'safe-verifySafeLanguage',
                    workerTaskId: 'verifySafeLanguage',
                    persistent: true,
                    maxAttempts: 3,
                    cooldown: {
                        minMessageAmount: 5,
                        durationMs: 30 * ONE_SECOND_MS,
                    },
                    context: {
                        messages: {
                            amount: 10,
                        },
                    },
                },
                {
                    id: 'safe-verifyEmotionalWellbeing',
                    workerTaskId: 'verifyEmotionalWellbeing',
                    maxAttempts: 3,
                    cooldown: {
                        minMessageAmount: 5,
                        durationMs: 30 * ONE_SECOND_MS,
                        startDelayMs: 90 * ONE_SECOND_MS,
                    },
                    context: {
                        messages: {
                            durationMs: 30 * ONE_SECOND_MS,
                        }
                    }
                }
            ],
            enrichments: [
                {
                    id: 'safe-enrichSafeBehaviour',
                    workerTaskId: 'enrichSafeBehaviour',
                    maxAttempts: 3,
                    executionType: 'onNotVerified',
                    cooldown: {
                        startDelayMs: 90 * ONE_SECOND_MS,
                        minMessageAmount: 10,
                        durationMs: 30 * ONE_SECOND_MS,
                    },
                    context: {
                        messages: {
                            durationMs: 30 * ONE_SECOND_MS,
                        }
                    },
                }
            ]
        },
        {
            id: 'informed',
            roomStatus: 'informed',
            verifications: [
                {
                    id: 'informed-verifyEasyLanguage',
                    workerTaskId: 'verifyEasyLanguage',
                    maxAttempts: 3,
                    cooldown: {
                        durationMs: 59 * ONE_SECOND_MS,
                    },
                    context: {
                        messages: {
                            amount: 10,
                        }
                    },
                },
                {
                    id: 'informed-verifyOffTopic',
                    workerTaskId: 'verifyOffTopic',
                    persistent: true,
                    maxAttempts: 3,
                    cooldown: {
                        durationMs: 59 * ONE_SECOND_MS,
                    },
                    context: {
                        messages: {
                            amount: 10,
                        }
                    },
                }
            ],
            enrichments: [
                {
                    id: 'informed-enrichOffTopic',
                    workerTaskId: 'enrichOffTopic',
                    maxAttempts: 3,
                    executionType: 'onNotVerified',
                    conditions: [{
                        isVerified: false,
                        progressionTaskId: 'informed-verifyOffTopic',
                    }],
                    cooldown: {
                        startDelayMs: 59 * ONE_SECOND_MS,
                        durationMs: 59 * ONE_SECOND_MS,
                    },
                    context: {
                        messages: {
                            amount: 10,
                        }
                    }
                }
            ]
        },
        {
            id: 'debate',
            roomStatus: 'debate',
            verifications: [
                {
                    id: 'debate-verifyEnoughContent',
                    workerTaskId: 'verifyEnoughContent',
                    maxAttempts: 5,
                    cooldown: {
                        startDelayMs: 59 * ONE_SECOND_MS,
                        durationMs: 59 * ONE_SECOND_MS,
                    },
                    context: {
                        messages: {
                            roomStatuses: ['debate', 'safe', 'informed'],
                        }
                    }
                },
                {
                    id: 'debate-verifyEqualParticipation',
                    workerTaskId: 'verifyEqualParticipation',
                    maxAttempts: 3,
                    cooldown: {
                        startDelayMs: 59 * ONE_SECOND_MS,
                        durationMs: 90 * ONE_SECOND_MS,
                    },
                    context: {
                        messages: {
                            durationMs: 3 * 60 * ONE_SECOND_MS,
                        }
                    }
                },
                {
                    id: 'debate-verifySmoothConversation',
                    workerTaskId: 'verifySmoothConversation',
                    maxAttempts: 3,
                    cooldown: {
                        startDelayMs: 59 * ONE_SECOND_MS,
                        durationMs: 59 * ONE_SECOND_MS,
                    },
                    context: {
                        messages: {
                            durationMs: 3 * 60 * ONE_SECOND_MS,
                        }
                    }
                }
            ],
            enrichments: [
                {
                    id: 'debate-enrichEqualParticipation',
                    workerTaskId: 'enrichEqualParticipation',
                    maxAttempts: 3,
                    executionType: 'onNotVerified',
                    conditions: [{
                        isVerified: false,
                        progressionTaskId: 'debate-verifyEqualParticipation',
                    }],
                    cooldown: {
                        startDelayMs: 119 * ONE_SECOND_MS,
                        durationMs: 59 * ONE_SECOND_MS,
                    },
                    context: {
                        messages: {
                            durationMs: 3 * 60 * ONE_SECOND_MS,
                        }
                    }
                },
                {
                    id: 'debate-enrichSmoothConversation',
                    workerTaskId: 'enrichSmoothConversation',
                    maxAttempts: 5,
                    executionType: 'onNotVerified',
                    conditions: [{
                        isVerified: false,
                        progressionTaskId: 'debate-verifySmoothConversation',
                    }],
                    cooldown: {
                        startDelayMs: 59 * ONE_SECOND_MS,
                        durationMs: 59 * ONE_SECOND_MS,
                    },
                    context: {
                        messages: {
                            durationMs: 3 * 60 * ONE_SECOND_MS,
                        }
                    }
                }
            ]
        },
        {
            id: 'results',
            roomStatus: 'results',
            verifications: [
                {
                    id: 'results-verifyConsensusForming',
                    workerTaskId: 'verifyConsensusForming',
                    cooldown: {
                        durationMs: 30 * ONE_SECOND_MS,
                    },
                    context: {
                        messages: {
                            roomStatuses: ['informed', 'debate', 'results'],
                        }
                    }
                }
            ],
            enrichments: [
                {

                    id: 'results-enrichConsensusStimulation',
                    workerTaskId: 'enrichConsensusStimulation',
                    maxAttempts: 1,
                    executionType: 'onNotVerified',
                    cooldown: {
                        startDelayMs: 59 * ONE_SECOND_MS,
                        durationMs: 59 * ONE_SECOND_MS,
                    },
                    context: {
                        messages: {
                            roomStatuses: ['informed', 'debate', 'results'],
                        }
                    },
                }
            ]
        },
        {
            id: 'close',
            roomStatus: 'close',
            verifications: [],
            enrichments: [
                {
                    id: 'close-enrichConsensusProposal',
                    workerTaskId: 'enrichConsensusProposal',
                    maxAttempts: 30,
                    executionType: 'alwaysBeforeVerification',
                    cooldown: {
                        durationMs: 60 * ONE_SECOND_MS,
                    },
                    context: {
                        messages: {
                            roomStatuses: ['informed', 'debate', 'results'],
                        }
                    }
                },
            ],
        }
    ],
};
