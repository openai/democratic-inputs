// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

import { ValidCreateExternalRoomResult } from "../lib/whereby";
import { OrchestratorRole } from "../types";
import dayjs from "dayjs";

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            ORCHESTRATOR_ROLE: OrchestratorRole;
            OPENAI_API_KEY: string;
            DATABASE_URL: string;
            SUPABASE_URL: string;
            SUPABASE_KEY: string;
            SENTRY_DSN: string;
            WHEREBY_BEARER_TOKEN: string;
        }
    }
}

const requiredEnvVars = [
    'DATABASE_URL',
    'SUPABASE_URL',
    'SUPABASE_KEY',
    'OPENAI_API_KEY',
    'SENTRY_DSN',
    'WHEREBY_BEARER_TOKEN',
];

// Check for missing environment variables
for (const requiredEnvVar of requiredEnvVars) {
    if (!(requiredEnvVar in process.env)) {
        throw new Error(`Missing ${requiredEnvVar} environment variable. Please add it to your environment or .env file`);
    }
}

/* Environment variables */
export const ORCHESTRATOR_ROLE: OrchestratorRole = process?.env?.ORCHESTRATOR_ROLE ?? 'all';
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const SUPABASE_URL = process.env.SUPABASE_URL;
export const DATABASE_URL = process.env.DATABASE_URL;
export const SUPABASE_KEY = process.env.SUPABASE_KEY;
export const SENTRY_DSN = process.env.SENTRY_DSN;
export const WHEREBY_BEARER_TOKEN = process.env.WHEREBY_BEARER_TOKEN;

/* Time */
export const ONE_SECOND_MS = 1000;
export const ONE_MINUTE_MS = 60 * ONE_SECOND_MS;

/* Progression */
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
export const DISABLE_CRONTAB = true && IS_DEVELOPMENT;
export const ENABLE_TASK_TESTING = false && IS_DEVELOPMENT;
export const ENABLE_SINGLE_ROOM_TESTING = true && IS_DEVELOPMENT;
export const TEST_ROOM_ID_ALLOWLIST = ['ee440eef-3cbd-48fd-ab37-a0ea12a7c895'];
export const ENABLE_ROOM_PROGRESSION = true || !IS_DEVELOPMENT;
export const PRINT_JOBKEY = true && IS_DEVELOPMENT;
export const PRINT_ROOM_PROGRESSION = true && IS_DEVELOPMENT;
export const ENABLE_TEST_WHEREBY_ROOM = false || !IS_DEVELOPMENT;
export const TEST_WHEREBY_ROOM: ValidCreateExternalRoomResult = {
    endDate: dayjs().add(1, 'hour').toISOString(),
    hostRoomUrl: '',
    meetingId: 'test',
    roomUrl: '',
    startDate: dayjs().toISOString(),
};

/* Deliberation */
export const DEVELOPMENT_PARTICIPANTS_PER_ROOM = 1;
export const PRODUCTION_PARTICIPANTS_PER_ROOM = 3;
export const PARTICIPANTS_PER_ROOM = IS_DEVELOPMENT ? DEVELOPMENT_PARTICIPANTS_PER_ROOM : PRODUCTION_PARTICIPANTS_PER_ROOM;
export const MAX_ROOM_DURATION_MS = 60 * ONE_MINUTE_MS;

/* Lobby */
export const PARTICIPANT_PING_EXPIRY_TIME_MS = 10 * ONE_SECOND_MS;
export const PARTICIPANT_CONFIRM_EXPIRY_TIME_MS = 30 * ONE_SECOND_MS;

/* Tasks */
export const HANDLE_QUEUED_PARTICIPANTS_INTERVAL_MS = 2 * ONE_SECOND_MS;

/* Whereby */
export const WHEREBY_API_URL = 'https://api.whereby.dev/v1/';
