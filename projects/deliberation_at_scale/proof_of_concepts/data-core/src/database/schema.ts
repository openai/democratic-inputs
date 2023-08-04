import { pgTable, uuid, boolean, varchar, timestamp, pgEnum, integer, text } from "drizzle-orm/pg-core";

// default field names
const ID_FIELD_NAME = 'id';
const ACTIVE_FIELD_NAME = 'active';
const CREATED_AT_FIELD_NAME = 'created_at';
const UPDATED_AT_FIELD_NAME = 'updated_at';

// table names
const USERS_TABLE_NAME = 'users';
const TOPICS_TABLE_NAME = 'topics';
const ROOMS_TABLE_NAME = 'rooms';
const PARTICIPANTS_TABLE_NAME = 'participants';
const DISCUSSIONS_TABLE_NAME = 'discussions';
const OUTCOMES_TABLE_NAME = 'outcomes';
const OUTCOME_SOURCES_TABLE_NAME = 'outcome_sources';
const OPINIONS_TABLE_NAME = 'opinions';
const CROSS_POLLINATIONS_TABLE_NAME = 'cross_pollinations';

// enums
export const topicType = pgEnum('topicType', ['original', 'remixed']);
export const discussionType = pgEnum('discussionType', ['chat', 'voice', 'bot']);
export const outcomeType = pgEnum('outcomeType', ['milestone', 'consensus', 'off_topic']);
export const opinionType = pgEnum('opinionType', ['relevance_range', 'agreement_range', 'statement']);
export const crossPollinationType = pgEnum('crossPollinationType', ['discussion', 'closing', 'afterwards']);

export const topics = pgTable(TOPICS_TABLE_NAME, {
  id: generateIdField(),
  active: generateActiveField(),
  type: topicType('type').notNull().default('original'),
  originalTopicId: uuid('original_topic_id').references(() => topics.id),
  content: text('content').notNull().default(''),
  ...generateTimestampFields(),
});

export const rooms = pgTable(ROOMS_TABLE_NAME, {
  id: generateIdField(),
  active: generateActiveField(),
  topicId: uuid('topic_id').notNull().references(() => topics.id),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  ...generateTimestampFields(),
});

export const users = pgTable(USERS_TABLE_NAME, {
  id: generateIdField(),
  active: generateActiveField(),
  nickName: generateNickNameField(),
  ...generateTimestampFields(),
});

export const participants = pgTable(PARTICIPANTS_TABLE_NAME, {
  id: generateIdField(),
  active: generateActiveField(),
  roomId: uuid('room_id').notNull().references(() => rooms.id),
  userId: uuid('user_id').references(() => users.id),
  nickName: generateNickNameField(),
  ...generateTimestampFields(),
});

export const discussions = pgTable(DISCUSSIONS_TABLE_NAME, {
  id: generateIdField(),
  active: generateActiveField(),
  type: discussionType('type').notNull().default('chat'),
  participantId: uuid('participant_id').references(() => participants.id), // can be null to track bot discussions
  content: text('content').notNull().default(''),
  ...generateTimestampFields(),
});

export const outcomes = pgTable(OUTCOMES_TABLE_NAME, {
  id: generateIdField(),
  active: generateActiveField(),
  type: outcomeType('type').notNull().default('milestone'),
  originalOutcomeId: uuid('original_outcome_id').references(() => outcomes.id),
  content: text('content').notNull().default(''),
  ...generateTimestampFields(),
});

export const outcomeSources = pgTable(OUTCOME_SOURCES_TABLE_NAME, {
  id: generateIdField(),
  outcomeId: uuid('outcome_id').notNull().references(() => outcomes.id),
  discussionId: uuid('discussion_id').notNull().references(() => discussions.id),
  ...generateTimestampFields(),
});

export const opinions = pgTable(OPINIONS_TABLE_NAME, {
  id: generateIdField(),
  active: generateActiveField(),
  type: opinionType('type').notNull().default('statement'),
  rangeValue: integer('range_value').notNull().default(0),
  statement: text('statement').notNull().default(''),
  ...generateTimestampFields(),
});

export const crossPollinations = pgTable(CROSS_POLLINATIONS_TABLE_NAME, {
  id: generateIdField(),
  active: generateActiveField(),
  type: crossPollinationType('type').notNull().default('discussion'),
  outcomeId: uuid('outcome_id').notNull().references(() => outcomes.id),

  // an outcome can be cross-pollinated to a room, participant, or user
  roomId: uuid('room_id').references(() => discussions.id),
  participantId: uuid('participant_id').references(() => participants.id),
  userId: uuid('user_id').references(() => users.id),
  ...generateTimestampFields(),
});

function generateIdField() {
  return uuid(ID_FIELD_NAME).primaryKey().notNull().defaultRandom();
};

function generateActiveField() {
  return boolean(ACTIVE_FIELD_NAME).notNull().default(true);
};

function generateNickNameField() {
  return varchar('nick_name', { length: 255 }).notNull().default('Anonymous');
};

function generateTimestampFields() {
  return {
    createdAt: timestamp(CREATED_AT_FIELD_NAME).notNull().defaultNow(),
    updatedAt: timestamp(UPDATED_AT_FIELD_NAME).notNull().defaultNow(),
  };
};
