// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

import { OrchestratorRole, ProgressionTopology } from "./types";

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            ORCHESTRATOR_ROLE: OrchestratorRole;
            OPENAI_API_KEY: string;
            SUPABASE_URL: string;
            SUPABASE_KEY: string;
            SENTRY_DSN: string;
        }
    }
}

if (!('SUPABASE_URL' in process.env)
    || !('SUPABASE_KEY' in process.env)
) {
    throw new Error('Please set SUPABASE_URL and/or SUPABASE_KEY in your environment or in your .env file.');
}

if (!("OPENAI_API_KEY" in process.env)) {
    throw new Error("Missing OPENAI_API_KEY environment variable. Please add it to your environment or .env file");
}

if (!("SENTRY_DSN" in process.env)) {
    throw new Error("Missing SENTRY_DSN environment variable. Please add it to your environment or .env file");
}

/* Environment variables */
export const ORCHESTRATOR_ROLE: OrchestratorRole = process?.env?.ORCHESTRATOR_ROLE ?? 'all';
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_KEY = process.env.SUPABASE_KEY;
export const SENTRY_DSN = process.env.SENTRY_DSN;

/* Time */
export const ONE_SECOND_MS = 1000;

/* TODO: in the tasks folder split folder into two: 1. checking tasks and 2. assistive tasks
/* The topology each room progresses through */
export const progressionTopology: Readonly<ProgressionTopology> = {
    layers: [
        {
            id: 'introductionParticipants',
            roomStatus: 'introduction_participants',
            verifications: [
                {
                    /* In this layer, the AI moderator will
                    - Verify whether has introduced themselves properly
                    - If no, execute a enrichment prompt participant(s) X nevertheless introduce themselves */
                    id: 'introductionParticipants-introductionParticipants',
                    workerTaskId: 'verifyIntroductionParticipants',
                    active: false,
                    fallback: false,
                    maxAtemptsInTotal: 20,
                    cooldownAmountMessages: 1,
                    context: {
                        messages: {
                            roomStatuses: ["introductionParticipants"]
                        }
                    },
                }
            ],
            enrichments: [
                {
                    /* Execute function maximum twice */
                    id: 'introductionParticipants-moderatorMessageParticipantIntroduction',
                    workerTaskId: 'enrichModeratorMessageParticipantIntroduction',
                    active: false,
                    cooldownSeconds: 60,
                    buffer: 60,
                    context: {
                        messages: {
                            roomStatuses: ["introductionParticipants"]
                        }
                    },
                },
            ]
        },
        {
            /* In this layer, the AI moderator will exectue the following
                - Execute an enrichment prompt that for a  a new topic
                - Execute an enrichment prompt that mixes an existing topic
                - Execute an enrichment prompt that crosspolinates a topic?
            - After this, the participant will go to the introduction_topic layer and it all starts over again
            TODO: check whether this is the right place to execute these prompts and write these in the topology */
            id: 'introductionTopic',
            roomStatus: 'introduction_topic',
            enrichments: [
                {
                    /* Execute function maximum twice */
                    id: 'introductionTopic-moderatorMessageTopicIntroduction',
                    workerTaskId: 'enrichModeratorMessageTopicIntroduction',
                    active: false,
                    maxAtemptsInLayer: 1,
                    buffer: 60,
                    context: {
                        messages: {
                            roomStatuses: ["introductionParticipants"]
                        }
                    },
                },
                {
                    id: 'introductionTopic-moderatorMessageTopicMixedIntroduction',
                    workerTaskId: 'enrichModeratorMessageTopicMixedIntroduction',
                    active: false,
                },
                {
                    id: 'introductionTopic-moderatorMessageTopicCrosspolinatedIntroduction',
                    workerTaskId: 'enrichProposalConsensusFormingIntroduction',
                    active: false,
                },
            ]
        },
        {
            id: 'safe',
            roomStatus: 'safe',
            verifications: [
                {
                    id: 'safe-badLanguage',
                    workerTaskId: 'verifyBadLanguage',
                    active: false,
                    fallback: true,
                    context: {
                        messages: {
                            amount: 1,
                        },
                    },
                },
                {
                    id: 'safe-emotionalWellbeing',
                    workerTaskId: 'verifyEmotionalWellbeing',
                    active: false,
                    maxAtemptsInLayer: 3,
                    cooldownSeconds: 30,
                    context: {
                        messages: {
                            durationMs: 30 * ONE_SECOND_MS,
                        }
                    }
                }
            ],
            enrichments: [
                {
                    id: 'safe-moderatorMessageSafeBehaviour',
                    workerTaskId: 'enrichModeratorMessageSafeBehaviour',
                    active: false,
                    /* Execute function to prompt safe environment after 1 minutes */
                    cooldownSeconds: 60,
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
                    //TODO: toevoegen dat hij moet kijken naar de oudere berichten en 'relatief' beoordeelt of het moeilijke taal is
                    id: 'informed-difficultLanguage',
                    workerTaskId: 'verifyDifficultLanguage',
                    active: false,
                    maxAtemptsInTotal: 3,
                    cooldownSeconds: 60,
                    context: {
                        messages: {
                            durationMs: 30 * ONE_SECOND_MS,
                        }
                    },
                },
                {
                    id: 'informed-offTopic',
                    workerTaskId: 'verifyOffTopic',
                    active: false,
                    fallback: true,
                    maxAtemptsInTotal: 3,
                    cooldownSeconds: 60,
                    context: {
                        messages: {
                            amount: 3,
                        }
                    },
                }
            ],
            enrichments: [
                {
                    id: 'informed-moderatorMessageInformedBehaviour',
                    workerTaskId: 'enrichModeratorMessageInformedBehaviour',
                    active: false,
                    cooldownSeconds: 60,
                    context: {
                        messages: {
                            historyAmountSeconds: 30,
                        }
                    },
                }
            ]
        },
        {
            /* In this layer, the AI moderator will
            - Verify whether its is enough content to form a consensus ==> TODO: this is quite similar to verify consensus forming
            - Verify whether there is equal participation among the participants and if no, will send a message explaining to have more equal participation
            - If there is no equal participation, it is alo possible to execute a enrichment prompt that points out a specific person to share their views */
            id: 'conversate',
            roomStatus: 'conversate',
            verifications: [
                {
                    id: 'conversate-enoughContent',
                    workerTaskId: 'verifyEnoughContent',
                    active: false,
                    cooldownSeconds: 20,
                    buffer: 10 * 60,
                    context: {
                        messages: {
                            historySpecifiedLayers: ['conversate'],
                            historyAllMessages: true,
                        }
                    }
                },
                {
                    id: 'conversate-equalParticipation',
                    workerTaskId: 'verifyEqualParticipation',
                    active: false,
                    buffer: 5 * 60,
                    cooldownSeconds: 60,
                    context: {
                        messages: {
                            historySpecifiedLayers: ['conversate'],
                            historyAmountSeconds: 3 * 60,
                        }
                    }
                }
            ],
            enrichments: [
                {
                    id: 'conversate-equalParticipation',
                    workerTaskId: 'enrichEqualParticipation',
                    active: false,
                    buffer: 5 * 60,
                    maxAtemptsInLayer: 1,
                    cooldownSeconds: 60,
                    context: {
                        messages: {
                            historySpecifiedLayers: ['conversate'],
                            historyAmountSeconds: 5 * 60,
                        }
                    }
                }
            ]
            //Do we need enrichments in this layer?
        },
        {
            /* In this layer, the AI moderator will
            - Verify whether its is able to create a consensus
            - If yes, execute a enrichment prompt that creates a proposal for a consensus
            - Meanwhile execute a enrichment prompt for stimulating participants to come together */
            id: 'results',
            roomStatus: 'results',
            verifications: [
                {
                    // possible addition of metaConsensus forming that forms a consensus upon shared values
                    id: 'results-consensusForming',
                    workerTaskId: 'verifyConsensusForming',
                    active: false,
                    cooldownSeconds: 30,
                    context: {
                        messages: {
                            historySpecifiedLayers: ['informed', 'conversate', 'results'],
                            historyAllMessages: true,
                        }
                    }
                }
            ],
            enrichments: [
                {
                    id: 'results-enrichProposalConsensusForming',
                    workerTaskId: 'enrichProposalConsensusForming',
                    active: false,
                    maxAtemptsInLayer: 1,
                    maxAtemptsInTotal: 3,
                    context: {
                        messages: {
                            historySpecifiedLayers: ['informed', 'conversate', 'results'],
                            historyAllMessages: true,
                        }
                    }

                },
                {

                    id: 'results-moderatorMessageStimulateConsensus',
                    workerTaskId: 'enrichModeratorMessageStimulateConsensus',
                    active: false,
                    maxAtemptsInLayer: 1,
                    cooldownSeconds: 60,
                    context: {
                        messages: {
                            historySpecifiedLayers: ['conversate', 'results', 'informed'],
                            historyAllMessages: true,
                        }
                    },
                }
            ]
        },
    ],
};

