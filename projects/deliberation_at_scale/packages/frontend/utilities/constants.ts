
/**
 * Environment variables from .env file
 * NOTE: make sure you use the `process.env.NEXT_PUBLIC_` prefix so NextJS can detect them
 */
export const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
export const NEXT_PUBLIC_WHEREBY_SUBDOMAIN = process.env.NEXT_PUBLIC_WHEREBY_SUBDOMAIN ?? 'deliberation-at-scale.whereby.com';

/**
 * Default theming
 */
export const DEFAULT_ROOM_BASE_COLOR = 'orange';
export const AUTHENTICATE_ROOM_BASE_COLOR = 'blue';
export const DELIBERATION_ROOM_BASE_COLOR = 'green';
export const ANIMATION_DURATION_S = '0.3s';

/**
 * Element IDs
 */
export const MAIN_SCROLL_CONTAINER_ID = 'main-scroll-container';

/**
 * Chat flows
 */
export const DEFAULT_BOT_MESSAGE_SPEED_MS = 1500;
export const FIXED_CHAT_FLOW_BOT_NAME = "Deliberation at Scale";
export const ROOM_CHAT_FLOW_BOT_NAME = "AI Moderator";

export const LOBBY_ALLOW_ASK_PERMISSION_STATE_KEY = 'allowAskPermission';
export const LOBBY_WAITING_FOR_ROOM_STATE_KEY = 'waitingForRoom';
export const PARTICIPANT_PING_INTERVAL_DELAY_MS = 1000;

/**
 * External rooms
 */
export const ENABLE_TEST_ROOM = true;
export const TEST_ROOM_ID = '0a323099-4c94-49f9-89ff-2bf11d4dfb21';
export const TEST_EXTERNAL_ROOM_ID = 'demo-af3daa38-58ac-4ce6-a5d7-8b9fcb5a728a';
