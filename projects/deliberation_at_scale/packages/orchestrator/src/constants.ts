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
                    active: false,
                    fallback: false,
                    /* Execute function maximum twice */
                    maxAtempts: 100,
                    /* Execute function again after 20 seconds  */
                    // coolDownSeconds: 20,
                    /* Execute function again after every message */
                    cooldownAmountMessages: 1,
                    /* Do check whether every participant has added something in the conversation  */
                    // inputFromAllParticipants: true,
                    context: {
                        messages: {
                            historyAll: true,
                        }
                    },
                }
            ],
            enrichments: [
                {
                    id: 'promptIntroductionParticipants',
                    active: false,
                    /* Execute function to prompt participants after 2 minutes to introduce themselves if not all participants have introduced themselves  */
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
                    id: 'promptSafe',
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
                    id: 'difficultLanguage',
                    active: false,
                    fallback: true,
                    maxAtempts: 3,
                    cooldownSeconds: 60,
                    context: {
                        messages: {
                            historyAmountMessages: 1,
                        }
                    },
                },
                {
                    id: 'offTopic',
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
                    id: 'promptInformed'
                }
            ]
        },
        {
            id: 'conversate',
            roomStatus: 'conversate',
            verifications: [
                {
                    id: 'enoughContent',
                    active: false,
                    cooldownSeconds: 0,
                    context: {
                        messages: {
                            historySpecifiedLayer: 'conversate',
                            historyAllMessages: true,
                        }
                    }
                }
            ]
        }
    ],
};

