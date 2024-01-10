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
    index,
} from "drizzle-orm/pg-core";

// table names to make it easy to rename them
// NOTE: rename the variable name here and in the schema definition!
export const USERS_TABLE_NAME = "users";
export const TOPICS_TABLE_NAME = "topics";
export const EVENTS_TABLE_NAME = "events";
export const ROOMS_TABLE_NAME = "rooms";
export const PARTICIPANTS_TABLE_NAME = "participants";
export const MESSAGES_TABLE_NAME = "messages";
export const OUTCOMES_TABLE_NAME = "outcomes";
export const OUTCOME_SOURCES_TABLE_NAME = "outcome_sources";
export const OPINIONS_TABLE_NAME = "opinions";
export const COMPLETIONS_TABLE_NAME = "completions";
export const MODERATIONS_TABLE_NAME = "moderations";
export const HELP_REQUESTS_TABLE_NAME = "help_requests";

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
export const COMPLETION_ID_FIELD_NAME = "completion_id";
export const MODERATION_ID_FIELD_NAME = "moderation_id";

// common field names
export const ID_FIELD_NAME = "id";
export const ACTIVE_FIELD_NAME = "active";
export const TARGET_TYPE_FIELD_NAME = "target_type";
export const CREATED_AT_FIELD_NAME = "created_at";
export const UPDATED_AT_FIELD_NAME = "updated_at";

// enums
// NOTE: use lowercase for enum values to avoid issues with postgres
export const topicType = pgEnum("topicType", ["original", "remixed"]);
export const messageType = pgEnum("messageType", ["chat", "voice", "bot"]);
export const roomStatusType = pgEnum("roomStatusType", ["group_intro", "topic_intro", "safe", "informed", "debate", "results", "close", "end"]);
export const helpRequestType = pgEnum("helpRequestType", ["facilitator", "technician"]);
export const startRoomStatusType = roomStatusType.enumValues[0];
export const outcomeType = pgEnum("outcomeType", [
    "milestone",
    "consensus",
    "off_topic",
    "cross_pollination",
    "seed_statement",

    "overall_impression",
    "topic_interest",
]);
export const opinionType = pgEnum("opinionType", [
    "relevance_range",
    "agreement_range",
    "statement",
    "option",
]);
export const opinionOptionType = pgEnum("opinionOptionType", [
    "agree",
    "maybe",
    "disagree",
    "wrong",

    "positive",
    "negative",
    "neutral",
]);
export const completionType = pgEnum("completionType", ["gpt"]);
export const targetType = pgEnum("targetType", [
    "user",
    "topic",
    "room",
    "participant",
    "message",
    "outcome",
    "opinion",
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
export const participantStatusType = pgEnum("participantStatusType", [
    "queued",
    "waiting_for_confirmation",
    "in_room",
    "end_of_session",
]);

export const users = pgTable(USERS_TABLE_NAME, {
    id: generateIdField(),
    authUserId: uuid(AUTH_USER_ID_FIELD_NAME).unique(),
    active: generateActiveField(),
    nickName: generateNickNameField(),
    demographics: json("demographics").notNull().default({}),
    ...generateTimestampFields(),
}, (table) => {
    return {
        authUserIdIndex: index().on(table.authUserId),
        ...generateActiveFieldIndex(table),
        ...generateTimestampFieldIndexes(table),
    };
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
}, (table) => {
    return {
        typeIndex: index().on(table.type),
        originalTopicIdIndex: index().on(table.originalTopicId),
        ...generateActiveFieldIndex(table),
        ...generateTimestampFieldIndexes(table),
    };
});

export const rooms = pgTable(ROOMS_TABLE_NAME, {
    id: generateIdField(),
    active: generateActiveField(),
    externalRoomId: text("external_room_id"),
    statusType: roomStatusType("status_type").notNull().default(startRoomStatusType),
    topicId: uuid(TOPIC_ID_FIELD_NAME)
        .notNull()
        .references(() => topics.id),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    ...generateTimestampFields(),
}, (table) => {
    return {
        statusTypeIndex: index().on(table.statusType),
        externalRoomIdIndex: index().on(table.externalRoomId),
        topicIdIndex: index().on(table.topicId),
        startsAtIndex: index().on(table.startsAt),
        ...generateActiveFieldIndex(table),
        ...generateTimestampFieldIndexes(table),
    };
});

export const events = pgTable(EVENTS_TABLE_NAME, {
    id: generateIdField(),
    active: generateActiveField(),
    name: text("name"),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    ...generateTimestampFields(),
}, (table) => {
    return {
        startsAtIndex: index().on(table.startsAt),
        endsAtIndex: index().on(table.endsAt),
        ...generateActiveFieldIndex(table),
        ...generateTimestampFieldIndexes(table),
    };
});

export const helpRequests = pgTable(HELP_REQUESTS_TABLE_NAME, {
    id: generateIdField(),
    active: generateActiveField(),
    type: helpRequestType("type").notNull().default('facilitator'),
    externalRoomUrl: text("external_room_url"),
    roomId: uuid(ROOM_ID_FIELD_NAME).references(() => rooms.id),
    participantId: uuid(PARTICIPANT_ID_FIELD_NAME).references(() => participants.id),
    ...generateTimestampFields(),
}, (table) => {
    return {
        typeIndex: index().on(table.type),
        roomIdIndex: index().on(table.roomId),
        participantIdIndex: index().on(table.participantId),
        ...generateActiveFieldIndex(table),
        ...generateTimestampFieldIndexes(table),
    };
});

export const participants = pgTable(PARTICIPANTS_TABLE_NAME, {
    id: generateIdField(),
    active: generateActiveField(),
    status: participantStatusType("status").notNull().default("queued"),
    roomId: uuid(ROOM_ID_FIELD_NAME)
        .references(() => rooms.id),
    userId: uuid(USER_ID_FIELD_NAME).references(() => users.id),
    nickName: generateNickNameField(),
    participationScore: integer("participation_score").notNull().default(0),
    demographics: json("demographics").notNull().default({}),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    ...generateTimestampFields(),
}, (table) => {
    return {
        statusIndex: index().on(table.status),
        roomIdIndex: index().on(table.roomId),
        userIdIndex: index().on(table.userId),
        participationScore: index().on(table.participationScore),
        lastSeenAtIndex: index().on(table.lastSeenAt),
        ...generateActiveFieldIndex(table),
        ...generateTimestampFieldIndexes(table),
    };
});

export const messages = pgTable(MESSAGES_TABLE_NAME, {
    id: generateIdField(),
    active: generateActiveField(),
    type: messageType("type").notNull().default("chat"),
    visibilityType: messageVisibilityType("visibility_type").notNull().default("public"),
    timingType: timingType("timing_type").notNull().default("during_room"),
    originalMessageId: uuid(ORIGINAL_MESSAGE_ID_FIELD_NAME).references(
        (): AnyPgColumn => messages.id
    ),
    participantId: uuid(PARTICIPANT_ID_FIELD_NAME).references(() => participants.id), // can be null to track bot messages
    roomId: uuid(ROOM_ID_FIELD_NAME).references(() => rooms.id), // can be null to send messages to specific participants outside of room
    roomStatusType: roomStatusType("room_status_type"),
    content: text("content").notNull().default(""),
    safeLanguage: boolean("safe_language"),
    easyLanguage: boolean("easy_language"),
    tags: text("tags").notNull().default(""), // comma separated list of tags
    embeddings: json("embeddings").notNull().default({}),
    ...generateTimestampFields(),
}, (table) => {
    return {
        typeIndex: index().on(table.type),
        visibilityTypeIndex: index().on(table.visibilityType),
        timingTypeIndex: index().on(table.timingType),
        originalMessageIdIndex: index().on(table.originalMessageId),
        participantIdIndex: index().on(table.participantId),
        roomIdIndex: index().on(table.roomId),
        safeLanguageIndex: index().on(table.safeLanguage),
        easyLanguageIndex: index().on(table.easyLanguage),
        ...generateActiveFieldIndex(table),
        ...generateTimestampFieldIndexes(table),
    };
});

export const outcomes = pgTable(OUTCOMES_TABLE_NAME, {
    id: generateIdField(),
    active: generateActiveField(),
    type: outcomeType("type").notNull().default("milestone"),
    roomId: uuid(ROOM_ID_FIELD_NAME).references(() => rooms.id),
    topicId: uuid(TOPIC_ID_FIELD_NAME).references(() => topics.id),
    originalOutcomeId: uuid(ORIGINAL_OUTCOME_ID_FIELD_NAME).references(() => outcomes.id),
    content: text("content").notNull().default(""),
    ...generateTimestampFields(),
}, (table) => {
    return {
        typeIndex: index().on(table.type),
        roomIdIndex: index().on(table.roomId),
        topicIdIndex: index().on(table.topicId),
        originalOutcomeIdIndex: index().on(table.originalOutcomeId),
        ...generateActiveFieldIndex(table),
        ...generateTimestampFieldIndexes(table),
    };
});

export const outcomeSources = pgTable(OUTCOME_SOURCES_TABLE_NAME, {
    id: generateIdField(),
    active: generateActiveField(),
    outcomeId: uuid(OUTCOME_ID_FIELD_NAME)
        .notNull()
        .references(() => outcomes.id),
    messageId: uuid(MESSAGE_ID_FIELD_NAME)
        .notNull()
        .references(() => messages.id),
    ...generateTimestampFields(),
}, (table) => {
    return {
        outcomeIdIndex: index().on(table.outcomeId),
        messageIdIndex: index().on(table.messageId),
        ...generateActiveFieldIndex(table),
        ...generateTimestampFieldIndexes(table),
    };
});

export const opinions = pgTable(OPINIONS_TABLE_NAME, {
    id: generateIdField(),
    active: generateActiveField(),
    type: opinionType("type").notNull().default("statement"),
    outcomeId: uuid(OUTCOME_ID_FIELD_NAME).references(() => outcomes.id),
    participantId: uuid(PARTICIPANT_ID_FIELD_NAME).notNull().references(() => participants.id),
    rangeValue: integer("range_value").notNull().default(0),
    statement: text("statement").notNull().default(""),
    optionType: opinionOptionType("option_type"),
    ...generateTimestampFields(),
}, (table) => {
    return {
        typeIndex: index().on(table.type),
        outcomeIdIndex: index().on(table.outcomeId),
        participantIdIndex: index().on(table.participantId),
        rangeValueIndex: index().on(table.rangeValue),
        optionTypeIndex: index().on(table.optionType),
        ...generateActiveFieldIndex(table),
        ...generateTimestampFieldIndexes(table),
    };
});

export const moderations = pgTable(MODERATIONS_TABLE_NAME, {
    id: generateIdField(),
    active: generateActiveField(),
    type: text("type").notNull(),
    jobKey: text("job_key"),
    statement: text("statement"),
    result: json("result").notNull().default({}),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    ...generateTargetFields(),
    ...generateTimestampFields(),
}, (table) => {
    return {
        typeIndex: index().on(table.type),
        jobKeyIndex: index().on(table.jobKey),
        completedAtIndex: index().on(table.completedAt),
        ...generateTargetFieldIndexes(table),
        ...generateTimestampFieldIndexes(table),
    };
});

export const completions = pgTable(COMPLETIONS_TABLE_NAME, {
    id: generateIdField(),
    active: generateActiveField(),
    type: completionType("type").notNull(),
    prompt: text("prompt").notNull(),
    model: json("model").notNull().default({}),
    variables: json("variables").notNull().default({}),
    response: text("prompt").notNull(),
    ...generateTargetFields(),
    ...generateTimestampFields(),
}, (table) => {
    return {
        typeIndex: index().on(table.type),
        ...generateActiveFieldIndex(table),
        ...generateTargetFieldIndexes(table),
        ...generateTimestampFieldIndexes(table),
    };
});

function generateIdField() {
    return uuid(ID_FIELD_NAME).primaryKey().notNull().defaultRandom();
}

function generateActiveField() {
    return boolean(ACTIVE_FIELD_NAME).notNull().default(true);
}

function generateNickNameField() {
    return varchar("nick_name", { length: 255 }).notNull().default("Contributor");
}

function generateTimestampFields() {
    return {
        createdAt: timestamp(CREATED_AT_FIELD_NAME, { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp(UPDATED_AT_FIELD_NAME, { withTimezone: true }).notNull().defaultNow(),
    };
}

function generateTimestampFieldIndexes(table) {
    return {
        createdAtIndex: index().on(table.createdAt),
        updatedAtIndex: index().on(table.updatedAt),
    };
}

function generateActiveFieldIndex(table) {
    return {
        active: index().on(table.active),
    };
}

function generateTargetFields() {
    return {
        targetType: targetType(TARGET_TYPE_FIELD_NAME),
        userId: uuid(USER_ID_FIELD_NAME).references(() => users.id),
        topicId: uuid(TOPIC_ID_FIELD_NAME).references(() => topics.id),
        roomId: uuid(ROOM_ID_FIELD_NAME).references(() => rooms.id),
        participantId: uuid(PARTICIPANT_ID_FIELD_NAME).references(
            () => participants.id
        ),
        messageId: uuid(MESSAGE_ID_FIELD_NAME).references(() => messages.id),
        outcomeId: uuid(OUTCOME_ID_FIELD_NAME).references(() => outcomes.id),
        opinionId: uuid(OPINION_ID_FIELD_NAME).references(() => opinions.id),
        completionId: uuid(COMPLETION_ID_FIELD_NAME).references(
            () => completions.id
        ),
        moderationId: uuid(MODERATION_ID_FIELD_NAME).references(
            () => moderations.id
        ),
    };
}

function generateTargetFieldIndexes(table) {
    return {
        targetTypeIndex: index().on(table.targetType),
        userIdIndex: index().on(table.userId),
        topicIdIndex: index().on(table.topicId),
        roomIdIndex: index().on(table.roomId),
        participantIdIndex: index().on(table.participantId),
        messageIdIndex: index().on(table.messageId),
        outcomeIdIndex: index().on(table.outcomeId),
        opinionIdIndex: index().on(table.opinionId),
        completionIdIndex: index().on(table.completionId),
        moderationIdIndex: index().on(table.moderationId),
    };
}
