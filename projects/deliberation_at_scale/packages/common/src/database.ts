// table names to make it easy to rename them
// NOTE: rename the variable name here and in the schema definition!
export const USERS_TABLE_NAME = "users";
export const TOPICS_TABLE_NAME = "topics";
export const ROOMS_TABLE_NAME = "rooms";
export const PARTICIPANTS_TABLE_NAME = "participants";
export const MESSAGES_TABLE_NAME = "messages";
export const OUTCOMES_TABLE_NAME = "outcomes";
export const OUTCOME_SOURCES_TABLE_NAME = "outcome_sources";
export const OPINIONS_TABLE_NAME = "opinions";
export const CROSS_POLLINATIONS_TABLE_NAME = "cross_pollinations";
export const COMPLETIONS_TABLE_NAME = "completions";
export const MODERATIONS_TABLE_NAME = "moderations";

// foreign key field names to make it easy to keep track when renaming tables
// NOTE: rename the variable name here and the field key in the schema definition!
export const TOPIC_ID_FIELD_NAME = "topic_id";
export const ORIGINAL_TOPIC_ID_FIELD_NAME = "original_topic_id";
export const ROOM_ID_FIELD_NAME = "room_id";
export const PARTICIPANT_ID_FIELD_NAME = "participant_id";
export const AUTH_USER_ID_FIELD_NAME = "auth_user_id";
export const USER_ID_FIELD_NAME = "user_id";
export const ORIGINAL_MESSAGE_ID_FIELD_NAME = "original_message_id";
export const MESSAGE_ID_FIELD_NAME = "message_id";
export const OUTCOME_ID_FIELD_NAME = "outcome_id";
export const ORIGINAL_OUTCOME_ID_FIELD_NAME = "original_outcome_id";
export const OPINION_ID_FIELD_NAME = "opinion_id";
export const CROSS_POLLINATION_ID_FIELD_NAME = "cross_pollination_id";
export const COMPLETION_ID_FIELD_NAME = "completion_id";
export const MODERATION_ID_FIELD_NAME = "moderation_id";
