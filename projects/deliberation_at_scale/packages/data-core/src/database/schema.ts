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
export const roomStatusType = pgEnum("roomStatusType", ["safe", "informed", "debate", "results"]);
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
export const completionType = pgEnum("completionType", ["gpt"]);
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
}, (table) => {
    return {
        authUserIdIndex: index("auth_user_id_index").on(table.authUserId),
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
        typeIndex: index("type_index").on(table.type),
        originalTopicIdIndex: index("original_topic_id_index").on(table.originalTopicId),
        ...generateActiveFieldIndex(table),
        ...generateTimestampFieldIndexes(table),
    };
});

export const rooms = pgTable(ROOMS_TABLE_NAME, {
    id: generateIdField(),
    active: generateActiveField(),
    externalRoomId: text("external_room_id"),
    statusType: roomStatusType("status_type").notNull().default("safe"),
    topicId: uuid(TOPIC_ID_FIELD_NAME)
        .notNull()
        .references(() => topics.id),
    startsAt: timestamp("starts_at"),
    ...generateTimestampFields(),
}, (table) => {
    return {
        statusTypeIndex: index("status_type_index").on(table.statusType),
        externalRoomIdIndex: index("external_room_id_index").on(table.externalRoomId),
        topicIdIndex: index("topic_id_index").on(table.topicId),
        startsAtIndex: index("starts_at_index").on(table.startsAt),
        ...generateActiveFieldIndex(table),
        ...generateTimestampFieldIndexes(table),
    };
});

export const participants = pgTable(PARTICIPANTS_TABLE_NAME, {
    id: generateIdField(),
    active: generateActiveField(),
    ready: boolean('ready').notNull().default(false),
    roomId: uuid(ROOM_ID_FIELD_NAME)
        .references(() => rooms.id),
    userId: uuid(USER_ID_FIELD_NAME).references(() => users.id),
    nickName: generateNickNameField(),
    participationScore: integer("participation_score").notNull().default(0),
    ...generateTimestampFields(),
}, (table) => {
    return {
        readyIndex: index("ready_index").on(table.ready),
        roomIdIndex: index("room_id_index").on(table.roomId),
        userIdIndex: index("user_id_index").on(table.userId),
        participationScore: index("participation_score_index").on(table.participationScore),
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
    participantId: uuid(PARTICIPANT_ID_FIELD_NAME).references(
        () => participants.id
    ), // can be null to track bot messages
    roomId: uuid(ROOM_ID_FIELD_NAME).references(() => rooms.id), // can be null to send messages to specific participants outside of room
    content: text("content").notNull().default(""),
    embeddings: json("embeddings").notNull().default({}),
    ...generateTimestampFields(),
}, (table) => {
    return {
        typeIndex: index("type_index").on(table.type),
        visibilityTypeIndex: index("visibility_type_index").on(table.visibilityType),
        timingTypeIndex: index("timing_type_index").on(table.timingType),
        originalMessageIdIndex: index("original_message_id_index").on(table.originalMessageId),
        participantIdIndex: index("participant_id_index").on(table.participantId),
        roomIdIndex: index("room_id_index").on(table.roomId),
        ...generateActiveFieldIndex(table),
        ...generateTimestampFieldIndexes(table),
    };
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
}, (table) => {
    return {
        typeIndex: index("type_index").on(table.type),
        originalOutcomeIdIndex: index("original_outcome_id_index").on(table.originalOutcomeId),
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
        outcomeIdIndex: index("outcome_id_index").on(table.outcomeId),
        messageIdIndex: index("message_id_index").on(table.messageId),
        ...generateActiveFieldIndex(table),
        ...generateTimestampFieldIndexes(table),
    };
});

export const opinions = pgTable(OPINIONS_TABLE_NAME, {
    id: generateIdField(),
    active: generateActiveField(),
    type: opinionType("type").notNull().default("statement"),
    outcomeId: uuid(OUTCOME_ID_FIELD_NAME).references(() => outcomes.id),
    rangeValue: integer("range_value").notNull().default(0),
    statement: text("statement").notNull().default(""),
    ...generateTimestampFields(),
}, (table) => {
    return {
        typeIndex: index("type_index").on(table.type),
        outcomeIdIndex: index("outcome_id_index").on(table.outcomeId),
        rangeValueIndex: index("range_value_index").on(table.rangeValue),
        ...generateActiveFieldIndex(table),
        ...generateTimestampFieldIndexes(table),
    };
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
}, (table) => {
    return {
        typeIndex: index("type_index").on(table.type),
        timingTypeIndex: index("timing_type_index").on(table.timingType),
        outcomeIdIndex: index("outcome_id_index").on(table.outcomeId),
        topicIdIndex: index("topic_id_index").on(table.topicId),
        roomIdIndex: index("room_id_index").on(table.roomId),
        participantIdIndex: index("participant_id_index").on(table.participantId),
        userIdIndex: index("user_id_index").on(table.userId),
        ...generateActiveFieldIndex(table),
        ...generateTimestampFieldIndexes(table),
    };
});

export const moderations = pgTable(MODERATIONS_TABLE_NAME, {
    id: generateIdField(),
    active: generateActiveField(),
    type: moderationType("type").notNull(),
    statement: text("statement").notNull().default(""),
    ...generateTargetFields(),
    ...generateTimestampFields(),
}, (table) => {
    return {
        typeIndex: index("type_index").on(table.type),
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
        typeIndex: index("type_index").on(table.type),
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
    return varchar("nick_name", { length: 255 }).notNull().default("Anonymous");
}

function generateTimestampFields() {
    return {
        createdAt: timestamp(CREATED_AT_FIELD_NAME).notNull().defaultNow(),
        updatedAt: timestamp(UPDATED_AT_FIELD_NAME).notNull().defaultNow(),
    };
}

function generateTimestampFieldIndexes(table) {
    return {
        createdAtIndex: index(`${CREATED_AT_FIELD_NAME}_index`).on(table.createdAt),
        updatedAtIndex: index(`${UPDATED_AT_FIELD_NAME}_index`).on(table.updatedAt),
    };
}

function generateActiveFieldIndex(table) {
    return {
        active: index(`${ACTIVE_FIELD_NAME}_index`).on(table.active),
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

function generateTargetFieldIndexes(table) {
    return {
        targetTypeIndex: index(`${TARGET_TYPE_FIELD_NAME}_index`).on(table.targetType),
        userIdIndex: index(`${USER_ID_FIELD_NAME}_index`).on(table.userId),
        topicIdIndex: index(`${TOPIC_ID_FIELD_NAME}_index`).on(table.topicId),
        roomIdIndex: index(`${ROOM_ID_FIELD_NAME}_index`).on(table.roomId),
        participantIdIndex: index(`${PARTICIPANT_ID_FIELD_NAME}_index`).on(table.participantId),
        messageIdIndex: index(`${MESSAGE_ID_FIELD_NAME}_index`).on(table.messageId),
        outcomeIdIndex: index(`${OUTCOME_ID_FIELD_NAME}_index`).on(table.outcomeId),
        opinionIdIndex: index(`${OPINION_ID_FIELD_NAME}_index`).on(table.opinionId),
        crossPollinationIdIndex: index(`${CROSS_POLLINATION_ID_FIELD_NAME}_index`).on(table.crossPollinationId),
        completionIdIndex: index(`${COMPLETION_ID_FIELD_NAME}_index`).on(table.completionId),
        moderationIdIndex: index(`${MODERATION_ID_FIELD_NAME}_index`).on(table.moderationId),
    };
}
