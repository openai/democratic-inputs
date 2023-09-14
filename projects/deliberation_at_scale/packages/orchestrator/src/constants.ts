// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions";
import { OrchestratorRole, ProgressionTopology } from "./types";

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            ORCHESTRATOR_ROLE: OrchestratorRole;
            OPENAI_API_KEY: string;
            SUPABASE_URL: string;
            SUPABASE_KEY: string;
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

/* Environment variables */
export const ORCHESTRATOR_ROLE: OrchestratorRole = process?.env?.ORCHESTRATOR_ROLE ?? 'all';
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_KEY = process.env.SUPABASE_KEY;

/* Time */
export const ONE_SECOND_MS = 1000;

/* TODO: in the tasks folder split folder into two: 1. checking tasks and 2. assistive tasks
/* The topology each room progresses through */
export const progressionTopology: Readonly<ProgressionTopology> = {
    layers: [
        {
            id: 'introduction_participants',
            roomStatus: 'introduction_participants',
            verifications: [
                {
                    /* Check whether each participant has introduced themselves properly */
                    id: 'introductionParticipants',
                    workerTaskId: 'introductionParticipants',
                    active: false,
                    fallback: false,
                    maxAtempts: 100, /* Execute function maximum twice */
                    cooldownAmountMessages: 1, //Execute again after every message
                    /* Do check whether every participant has added something in the conversation  */
                    // inputFromAllParticipants: true,
                    context: {
                        messages: {
                            historyAllMessages: true,
                            historySpecifiedLayers: ["introduction_participants"]
                        }
                    },
                }
            ],
            enrichments: [
                {
                    /* Execute function maximum twice */
                    id: 'enrichModeratorMessageParticipantIntroduction',
                    workerTaskId: 'enrichModeratorMessageParticipantIntroduction',
                    active: false,
                    cooldownSeconds: 120,
                    context: {
                        messages: {
                            historyAllMessages: true,
                        }
                    },
                }
            ]

        },
        {
            id: 'safe',
            roomStatus: 'safe',
            verifications: [
                {
                    id: 'safe-badLanguage',
                    workerTaskId: 'badLanguage',
                    active: false,
                    fallback: true,
                    context: {
                        messages: {
                            historyAmountMessages: 1,
                        },
                    },
                },
                {
                    id: 'emotionalWellbeing',
                    workerTaskId: 'emotionalWellbeing',
                    active: false,
                    maxAtempts: 3,
                    cooldownSeconds: 30,
                    context: {
                        messages: {
                            historyAmountSeconds: 30,
                        }
                    }
                }
            ],
            enrichments: [
                {
                    id: 'enrichModeratorMessageSafeBehaviour',
                    workerTaskId: 'enrichModeratorMessageSafeBehaviour',
                    active: false,
                    /* Execute function to prompt safe environment after 1 minutes */
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
            id: 'informed',
            roomStatus: 'informed',
            verifications: [
                {
                    //TODO: toevoegen dat hij moet kijken naar de oudere berichten en 'relatief' beoordeelt of het moeilijke taal is
                    id: 'difficultLanguage',
                    workerTaskId: 'difficultLanguage',
                    active: false,
                    maxAtempts: 3,
                    cooldownSeconds: 60,
                    context: {
                        messages: {
                            historyAmountSeconds: 30,
                        }
                    },
                },
                {
                    id: 'offTopic',
                    workerTaskId: 'offTopic',
                    active: false,
                    fallback: true,
                    maxAtempts: 3,
                    cooldownSeconds: 60,
                    context: {
                        messages: {
                            historyAmountMessages: 3,
                        }
                    },
                }
            ],
            enrichments: [
                {
                    id: 'enrichModeratorMessageInformedBehaviour',
                    workerTaskId: 'enrichModeratorMessageInformedBehaviour',
                    active: false,
                    /* Execute function to prompt informed environment after 1 minutes */
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
            id: 'conversate',
            roomStatus: 'conversate',
            verifications: [
                {
                    id: 'enoughContent',
                    workerTaskId: 'enoughContent',
                    active: false,
                    cooldownSeconds: 20,
                    buffer: 5 * 60,
                    context: {
                        messages: {
                            historySpecifiedLayers: ['conversate'],
                            historyAllMessages: true,
                        }
                    }
                },
                {
                    id: 'equalParticipation',
                    workerTaskId: 'equalParticipation',
                    active: false,
                    cooldownSeconds: 60,
                    context: {
                        messages: {
                            historySpecifiedLayers: ['conversate'],
                            historyAmountSeconds: 3 * 60,
                        }
                    }
                }
            ]
            //Do we need enrichments in this layer?
        },
        {
            id: 'results',
            roomStatus: 'results',
            verifications: [
                {
                    // possible addition of metaConsensus forming that forms a consensus upon shared values 
                    id: 'consensusForming',
                    workerTaskId: 'consensusForming',
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
                    id: 'enrichModeratorMessageStimulateConsensus',
                    workerTaskId: 'enrichModeratorMessageStimulateConsensus',
                    active: false,
                    // buffer?
                    // maxAtempts: 3x? 
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
        {
            id: 'conclude',
            roomStatus: 'conclude',
            verifications: [
                //Do we need verifications here?
            ]

        }
    ],
};

