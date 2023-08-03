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

// enums
export const topicType = pgEnum('topicType', ['original', 'remixed']);
export const discussionType = pgEnum('discussionType', ['chat', 'voice', 'bot']);
export const outcomeType = pgEnum('outcomeType', ['milestone', 'consensus', 'off_topic']);
export const opinionType = pgEnum('opinionType', ['relevance_range', 'agreement_range', 'statement']);

export const topics = pgTable(TOPICS_TABLE_NAME, {
  id: generateIdField(),
  active: generateActiveField(),
  type: topicType('type').notNull().default('original'),
  ...generateTimestampFields(),
});

export const rooms = pgTable(ROOMS_TABLE_NAME, {
  id: generateIdField(),
  active: generateActiveField(),
  ...generateTimestampFields(),
});

export const users = pgTable(USERS_TABLE_NAME, {
  id: generateIdField(),
  active: generateActiveField(),
  ...generateTimestampFields(),
});

export const participants = pgTable(PARTICIPANTS_TABLE_NAME, {
  id: generateIdField(),
  active: generateActiveField(),
  roomId: uuid('room_id').notNull().references(() => rooms.id),
  nickName: varchar('nick_name', { length: 255 }).notNull().default('Anonymous'),
  ...generateTimestampFields(),
});

export const discussions = pgTable(DISCUSSIONS_TABLE_NAME, {
  id: generateIdField(),
  active: generateActiveField(),
  type: discussionType('type').notNull().default('chat'),
  participantId: uuid('participant_id').references(() => participants.id), // can be null to support bot discussions
  content: text('content').notNull().default(''),
  ...generateTimestampFields(),
});

export const outcomes = pgTable(OUTCOMES_TABLE_NAME, {
  id: generateIdField(),
  active: generateActiveField(),
  type: outcomeType('type').notNull().default('milestone'),
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

function generateIdField() {
  return uuid(ID_FIELD_NAME).primaryKey().notNull().defaultRandom();
};

function generateActiveField() {
  return boolean(ACTIVE_FIELD_NAME).notNull().default(true);
};

function generateTimestampFields() {
  return {
    created_at: timestamp(CREATED_AT_FIELD_NAME).notNull().defaultNow(),
    updated_at: timestamp(UPDATED_AT_FIELD_NAME).notNull().defaultNow(),
  };
};
