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

/* The topology each room progresses through */
export const progressionTopology: Readonly<ProgressionTopology> = {
    layers: [
        {
            id: 'safe',
            roomStatus: 'safe',
            verifications: [
                {
                    id: 'badLanguage',
                    context: {
                        messages: {
                            historyAmountSeconds: 10,
                        },
                    },
                },
            ],
        },
    ],
};

