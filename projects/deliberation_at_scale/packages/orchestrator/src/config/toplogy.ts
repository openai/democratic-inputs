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
                    maxAttempts: 12,
                    cooldown: {
                        messageAmount: 1,
                        durationMs: 15 * ONE_SECOND_MS,
                        startDelayMs: 60 * ONE_SECOND_MS,
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
                    maxAttempts: 3, //Max attempts should not be necessary for enrichments?
                    executionType: 'onNotVerified',
                    cooldown: {
                        startDelayMs: 30 * ONE_SECOND_MS,
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
                    maxAttempts: 3,
                    // context: {
                    //     messages: {
                    //         roomStatuses: ["topic_intro"]
                    //     }
                    // },
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
                    fallback: true,
                    maxAttempts: 3,
                    cooldown: {
                        messageAmount: 5,
                        durationMs: 10 * ONE_SECOND_MS,
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
                        durationMs: 30 * ONE_SECOND_MS,
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
                    cooldown: {
                        durationMs: 60 * ONE_SECOND_MS,
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
                        durationMs: 60 * ONE_SECOND_MS,
                    },
                    context: {
                        messages: {
                            durationMs: 30 * ONE_SECOND_MS,
                        }
                    },
                },
                {
                    id: 'informed-verifyOffTopic',
                    workerTaskId: 'verifyOffTopic',
                    fallback: true,
                    maxAttempts: 3,
                    cooldown: {
                        durationMs: 60 * ONE_SECOND_MS,
                    },
                    context: {
                        messages: {
                            amount: 5,
                        }
                    },
                }
            ],
        },
        {
            id: 'debate',
            roomStatus: 'debate',
            verifications: [
                {
                    id: 'conversate-verifyEnoughContent',
                    workerTaskId: 'verifyEnoughContent',
                    maxAttempts: 5,
                    cooldown: {
                        durationMs: 20 * ONE_SECOND_MS,
                    },
                    context: {
                        messages: {
                            roomStatuses: ['debate'],
                        }
                    }
                },
                {
                    id: 'conversate-verifyEqualParticipation',
                    workerTaskId: 'verifyEqualParticipation',
                    maxAttempts: 5,
                    cooldown: {
                        durationMs: 60 * ONE_SECOND_MS,
                    },
                    context: {
                        messages: {
                            roomStatuses: ['debate'],
                            durationMs: 3 * 60 * ONE_SECOND_MS,
                        }
                    }
                }
            ],
            enrichments: [
                {
                    id: 'conversate-enrichEqualParticipation',
                    workerTaskId: 'enrichEqualParticipation',
                    maxAttempts: 1,
                    cooldown: {
                        durationMs: 60 * ONE_SECOND_MS,
                    },
                    context: {
                        messages: {
                            roomStatuses: ['debate'],
                            durationMs: 5 * 60 * ONE_SECOND_MS,
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
                    cooldown: {
                        durationMs: 60 * ONE_SECOND_MS,
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
                    maxAttempts: 3,
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
