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
                        messageAmount: 1,
                        durationMs: 60 * ONE_SECOND_MS,
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
                    id: 'groupIntro-enrichGroupIntroduction',
                    workerTaskId: 'enrichGroupIntroduction',
                    cooldown: {
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
                    context: {
                        messages: {
                            roomStatuses: ["topic_intro"]
                        }
                    },
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
            enrichments: [
                {
                    id: 'informed-enrichInformedBehaviour',
                    workerTaskId: 'enrichInformedBehaviour',
                    cooldown: {
                        durationMs: 60 * ONE_SECOND_MS,
                    },
                    context: {
                        messages: {
                            durationMs: 60 * ONE_SECOND_MS,
                        }
                    },
                }
            ]
        },
        {
            id: 'debate',
            roomStatus: 'debate',
            verifications: [
                {
                    id: 'conversate-verifyEnoughContent',
                    workerTaskId: 'verifyEnoughContent',
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
