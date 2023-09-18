// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

import { OrchestratorRole } from "../types";

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

/* Progression */
export const ENABLE_ROOM_TESTING = true;
export const TEST_ROOM_ID_ALLOWLIST = ['50361572-6e7d-4390-bc1b-55725846056a'];
export const ENABLE_ROOM_PROGRESSION = !ENABLE_ROOM_TESTING || false;

/* Deliberation */
export const PARTICIPANTS_PER_ROOM = 3;

/* Time */
export const ONE_SECOND_MS = 1000;
