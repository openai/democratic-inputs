import { OutcomeType } from "@/generated/graphql";

/**
 * Environment variables from .env file
 * NOTE: make sure you use the `process.env.NEXT_PUBLIC_` prefix so NextJS can detect them
 */
export const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
export const NEXT_PUBLIC_WHEREBY_SUBDOMAIN = process.env.NEXT_PUBLIC_WHEREBY_SUBDOMAIN ?? 'deliberation-at-scale.whereby.com';
export const NEXT_PUBLIC_TRANSCRIBE_API_URL = process.env.NEXT_PUBLIC_TRANSCRIBE_API_URL ?? '';

/**
 * Default theming
 */
export const DEFAULT_ROOM_BASE_COLOR = 'orange';
export const AUTHENTICATE_ROOM_BASE_COLOR = 'blue';
export const DELIBERATION_ROOM_BASE_COLOR = 'green';
export const ANIMATION_DURATION_S = '0.3s';

/**
 * Language
 */
export const DEFAULT_LANGUAGE = 'en';

/**
 * Time
 */
export const ONE_SECOND_MS = 1000;

/**
 * Element IDs
 */
export const MESSAGES_SCROLL_CONTAINER_ID = 'messages-scroll-container';

/**
 * Chat flows
 */
export const DEFAULT_BOT_MESSAGE_SPEED_MS = ONE_SECOND_MS * 1.5;

export const LOBBY_ALLOW_ASK_PERMISSION_STATE_KEY = 'allowAskPermission';
export const LOBBY_WAITING_FOR_ROOM_STATE_KEY = 'waitingForRoom';
export const LOBBY_FOUND_ROOM_STATE_KEY = 'foundRoom';
export const LOBBY_WANT_TO_JOIN_ROOM_STATE_KEY = 'wantToJoinRoom';
export const PARTICIPANT_PING_INTERVAL_DELAY_MS = ONE_SECOND_MS;

/**
 * Enable when you want all the `useRealtimeQuery` wrappers to automatically refetch periodically
 */
export const ENABLE_AUTO_QUERY_REFETCH = false;
export const AUTO_QUERY_REFETCH_INTERVAL_MS = ONE_SECOND_MS * 5;

/**
 * Rooms
 */
export const PARTICIPANTS_PER_ROOM = 3;
export const SHOW_VIDEO_CONTROLS_INITIALLY = true;
export const ENABLE_WHEREBY = true;
export const ENABLE_TEST_ROOM = false;
// nice conversation: 5ab38de6-3516-4b9e-8b1a-67e80f3b38c2
export const TEST_ROOM_ID = 'fab98755-ff11-4241-91c6-0b4da1ea2d02'; // '0a323099-4c94-49f9-89ff-2bf11d4dfb21'; ee440eef-3cbd-48fd-ab37-a0ea12a7c895
export const TEST_EXTERNAL_ROOM_ID = 'https://deliberation-at-scale.whereby.com/das-c01b747d-b9b5-43d3-8b95-c8312ec6538f';
export const ROOM_JOINING_EXPIRY_TIME_MS = ONE_SECOND_MS * 30;

/**
 * Transcriptions
 */
export const ENABLE_TRANSCRIPTION = false;
export const ENABLE_AUTO_START_TRANSCRIPTION = false && ENABLE_TRANSCRIPTION;
export const DEFAULT_TRANSCRIPTION_CHUNK_DURATION_MS = ONE_SECOND_MS * 60 * 2;
export const DEFAULT_TRANSCRIPTION_TIME_SLICE_MS = ONE_SECOND_MS * 60 * 2;
export const TRANSCRIBE_VALID_MIN_TEXT_LENGTH = 30;

/**
 * Opinions
 */
export const DISABLE_OPINION_INPUT_WHEN_TIMED_OUT = false;
export const OUTCOME_OPINION_TIMEOUT_MS_LOOKUP: Record<OutcomeType, number> = {
    [OutcomeType.Consensus]: 15 * ONE_SECOND_MS,
    [OutcomeType.CrossPollination]: 0,
    [OutcomeType.Milestone]: 0,
    [OutcomeType.OffTopic]: 0,
    [OutcomeType.OverallImpression]: 0,
    [OutcomeType.TopicInterest]: 0
};
