import {
    pgTable,
    uuid,
    boolean,
    varchar,
    timestamp,
    pgEnum,
    integer,
    text,
    json,
    AnyPgColumn,
} from "drizzle-orm/pg-core";

// table names to make it easy to rename them
// NOTE: rename the variable name here and in the schema definition!
const USERS_TABLE_NAME = "users";
const TOPICS_TABLE_NAME = "topics";
const ROOMS_TABLE_NAME = "rooms";
const PARTICIPANTS_TABLE_NAME = "participants";
const MESSAGES_TABLE_NAME = "messages";
const OUTCOMES_TABLE_NAME = "outcomes";
const OUTCOME_SOURCES_TABLE_NAME = "outcome_sources";
const OPINIONS_TABLE_NAME = "opinions";
const CROSS_POLLINATIONS_TABLE_NAME = "cross_pollinations";
const COMPLETIONS_TABLE_NAME = "completions";
const MODERATIONS_TABLE_NAME = "moderations";

// foreign key field names to make it easy to keep track when renaming tables
// NOTE: rename the variable name here and the field key in the schema definition!
const TOPIC_ID_FIELD_NAME = "topic_id";
const ORIGINAL_TOPIC_ID_FIELD_NAME = "original_topic_id";
const ROOM_ID_FIELD_NAME = "room_id";
const PARTICIPANT_ID_FIELD_NAME = "participant_id";
const AUTH_USER_ID_FIELD_NAME = "auth_user_id";
const USER_ID_FIELD_NAME = "user_id";
const ORIGINAL_MESSAGE_ID_FIELD_NAME = "original_message_id";
const MESSAGE_ID_FIELD_NAME = "message_id";
const OUTCOME_ID_FIELD_NAME = "outcome_id";
const ORIGINAL_OUTCOME_ID_FIELD_NAME = "original_outcome_id";
const OPINION_ID_FIELD_NAME = "opinion_id";
const CROSS_POLLINATION_ID_FIELD_NAME = "cross_pollination_id";
const COMPLETION_ID_FIELD_NAME = "completion_id";
const MODERATION_ID_FIELD_NAME = "moderation_id";

// common field names
const ID_FIELD_NAME = "id";
const ACTIVE_FIELD_NAME = "active";
const CREATED_AT_FIELD_NAME = "created_at";
const UPDATED_AT_FIELD_NAME = "updated_at";

// enums
// NOTE: use lowercase for enum values to avoid issues with postgres
export const topicType = pgEnum("topicType", ["original", "remixed"]);
export const messageType = pgEnum("messageType", ["chat", "voice", "bot"]);
export const outcomeType = pgEnum("outcomeType", [
    "milestone",
    "consensus",
    "off_topic",
]);
export const opinionType = pgEnum("opinionType", [
    "relevance_range",
    "agreement_range",
    "statement",
]);
export const crossPollinationType = pgEnum("crossPollinationType", [
    "outcome",
    "topic",
]);
export const moderationType = pgEnum("moderationType", [
    "harrashment",
    "consensus",
    "unequal",
    "clarification",
    "spam",
    "off_topic",
    "other",
]);
export const completionType = pgEnum("completionType", ["gpt4"]);
export const targetType = pgEnum("targetType", [
    "user",
    "topic",
    "room",
    "participant",
    "message",
    "outcome",
    "opinion",
    "cross_pollination",
    "completion",
    "moderation",
]);
export const timingType = pgEnum("timingType", [
    "before_room",
    "during_room",
    "after_room",
    "standalone",
]);
export const messageVisibilityType = pgEnum("visibilityType", [
    "public",
    "private",
]);

export const users = pgTable(USERS_TABLE_NAME, {
    id: generateIdField(),
    authUserId: uuid(AUTH_USER_ID_FIELD_NAME).unique(),
    active: generateActiveField(),
    nickName: generateNickNameField(),
    demographics: json("demographics").notNull().default({}),
    ...generateTimestampFields(),
});

export const topics = pgTable(TOPICS_TABLE_NAME, {
    id: generateIdField(),
    active: generateActiveField(),
    type: topicType("type").notNull().default("original"),
    originalTopicId: uuid(ORIGINAL_TOPIC_ID_FIELD_NAME).references(
        (): AnyPgColumn => topics.id
    ),
    content: text("content").notNull().default(""),
    ...generateTimestampFields(),
});

export const rooms = pgTable(ROOMS_TABLE_NAME, {
    id: generateIdField(),
    active: generateActiveField(),
    externalRoomId: text("external_room_id"),
    topicId: uuid(TOPIC_ID_FIELD_NAME)
        .notNull()
        .references(() => topics.id),
    startsAt: timestamp("starts_at").notNull().defaultNow(),
    ...generateTimestampFields(),
});

export const participants = pgTable(PARTICIPANTS_TABLE_NAME, {
    id: generateIdField(),
    active: generateActiveField(),
    roomId: uuid(ROOM_ID_FIELD_NAME)
        .references(() => rooms.id),
    userId: uuid(USER_ID_FIELD_NAME).references(() => users.id),
    nickName: generateNickNameField(),
    participationScore: integer("participation_score").notNull().default(0),
    ...generateTimestampFields(),
});

export const messages = pgTable(MESSAGES_TABLE_NAME, {
    id: generateIdField(),
    active: generateActiveField(),
    type: messageType("type").notNull().default("chat"),
    visibilityType: messageVisibilityType("visibility_type").notNull().default("public"),
    originalMessageId: uuid(ORIGINAL_MESSAGE_ID_FIELD_NAME).references(
        (): AnyPgColumn => messages.id
    ),
    timingType: timingType("timing_type").notNull().default("during_room"),
    participantId: uuid(PARTICIPANT_ID_FIELD_NAME).references(
        () => participants.id
    ), // can be null to track bot messages
    roomId: uuid(ROOM_ID_FIELD_NAME).references(() => rooms.id), // can be null to send messages to specific participants outside of room
    content: text("content").notNull().default(""),
    embeddings: json("embeddings").notNull().default({}),
    ...generateTimestampFields(),
});

export const outcomes = pgTable(OUTCOMES_TABLE_NAME, {
    id: generateIdField(),
    active: generateActiveField(),
    type: outcomeType("type").notNull().default("milestone"),
    originalOutcomeId: uuid(ORIGINAL_OUTCOME_ID_FIELD_NAME).references(
        (): AnyPgColumn => outcomes.id
    ),
    content: text("content").notNull().default(""),
    ...generateTimestampFields(),
});

export const outcomeSources = pgTable(OUTCOME_SOURCES_TABLE_NAME, {
    id: generateIdField(),
    outcomeId: uuid(OUTCOME_ID_FIELD_NAME)
        .notNull()
        .references(() => outcomes.id),
    messageId: uuid(MESSAGE_ID_FIELD_NAME)
        .notNull()
        .references(() => messages.id),
    ...generateTimestampFields(),
});

export const opinions = pgTable(OPINIONS_TABLE_NAME, {
    id: generateIdField(),
    active: generateActiveField(),
    type: opinionType("type").notNull().default("statement"),
    outcomeId: uuid(OUTCOME_ID_FIELD_NAME).references(() => outcomes.id),
    rangeValue: integer("range_value").notNull().default(0),
    statement: text("statement").notNull().default(""),
    ...generateTimestampFields(),
});

export const crossPollinations = pgTable(CROSS_POLLINATIONS_TABLE_NAME, {
    id: generateIdField(),
    active: generateActiveField(),
    type: crossPollinationType("type").notNull(),
    timingType: timingType("timing_type").notNull().default("during_room"),

    // an outcome or topic can be cross-pollinated
    outcomeId: uuid(OUTCOME_ID_FIELD_NAME).references(() => outcomes.id),
    topicId: uuid(TOPIC_ID_FIELD_NAME).references(() => topics.id),

    // an outcome can be cross-pollinated to a room, participant, or user
    roomId: uuid(ROOM_ID_FIELD_NAME).references(() => messages.id),
    participantId: uuid(PARTICIPANT_ID_FIELD_NAME).references(
        () => participants.id
    ),
    userId: uuid(USER_ID_FIELD_NAME).references(() => users.id),

    ...generateTimestampFields(),
});

export const moderations = pgTable(MODERATIONS_TABLE_NAME, {
    id: generateIdField(),
    active: generateActiveField(),
    type: moderationType("type").notNull(),
    statement: text("statement").notNull().default(""),
    targetType: targetType("target_type").notNull(),
    ...generateTargetFields(),
    ...generateTimestampFields(),
});

export const completions = pgTable(COMPLETIONS_TABLE_NAME, {
    id: generateIdField(),
    active: generateActiveField(),
    type: completionType("type").notNull(),
    prompt: text("prompt").notNull(),
    model: json("model").notNull().default({}),
    variables: json("variables").notNull().default({}),
    response: text("prompt").notNull(),
    targetType: targetType("target_type").notNull(),
    ...generateTargetFields(),
    ...generateTimestampFields(),
});

function generateIdField() {
    return uuid(ID_FIELD_NAME).primaryKey().notNull().defaultRandom();
}

function generateActiveField() {
    return boolean(ACTIVE_FIELD_NAME).notNull().default(true);
}

function generateNickNameField() {
    return varchar("nick_name", { length: 255 }).notNull().default("Anonymous");
}

function generateTimestampFields() {
    return {
        createdAt: timestamp(CREATED_AT_FIELD_NAME).notNull().defaultNow(),
        updatedAt: timestamp(UPDATED_AT_FIELD_NAME).notNull().defaultNow(),
    };
}

function generateTargetFields() {
    return {
        userId: uuid(USER_ID_FIELD_NAME).references(() => users.id),
        topicId: uuid(TOPIC_ID_FIELD_NAME).references(() => topics.id),
        roomId: uuid(ROOM_ID_FIELD_NAME).references(() => rooms.id),
        participantId: uuid(PARTICIPANT_ID_FIELD_NAME).references(
            () => participants.id
        ),
        messageId: uuid(MESSAGE_ID_FIELD_NAME).references(() => messages.id),
        outcomeId: uuid(OUTCOME_ID_FIELD_NAME).references(() => outcomes.id),
        opinionId: uuid(OPINION_ID_FIELD_NAME).references(() => opinions.id),
        crossPollinationId: uuid(CROSS_POLLINATION_ID_FIELD_NAME).references(
            () => crossPollinations.id
        ),
        completionId: uuid(COMPLETION_ID_FIELD_NAME).references(
            () => completions.id
        ),
        moderationId: uuid(MODERATION_ID_FIELD_NAME).references(
            () => moderations.id
        ),
    };
}
