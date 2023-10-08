/* eslint-disable */
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigFloat: { input: any; output: any; }
  BigInt: { input: any; output: any; }
  Cursor: { input: any; output: any; }
  Date: { input: any; output: any; }
  Datetime: { input: any; output: any; }
  JSON: { input: any; output: any; }
  Opaque: { input: any; output: any; }
  Time: { input: any; output: any; }
  UUID: { input: any; output: any; }
};

/** Boolean expression comparing fields on type "BigFloat" */
export type BigFloatFilter = {
  eq?: InputMaybe<Scalars['BigFloat']['input']>;
  gt?: InputMaybe<Scalars['BigFloat']['input']>;
  gte?: InputMaybe<Scalars['BigFloat']['input']>;
  in?: InputMaybe<Array<Scalars['BigFloat']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['BigFloat']['input']>;
  lte?: InputMaybe<Scalars['BigFloat']['input']>;
  neq?: InputMaybe<Scalars['BigFloat']['input']>;
};

/** Boolean expression comparing fields on type "BigInt" */
export type BigIntFilter = {
  eq?: InputMaybe<Scalars['BigInt']['input']>;
  gt?: InputMaybe<Scalars['BigInt']['input']>;
  gte?: InputMaybe<Scalars['BigInt']['input']>;
  in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['BigInt']['input']>;
  lte?: InputMaybe<Scalars['BigInt']['input']>;
  neq?: InputMaybe<Scalars['BigInt']['input']>;
};

/** Boolean expression comparing fields on type "Boolean" */
export type BooleanFilter = {
  eq?: InputMaybe<Scalars['Boolean']['input']>;
  is?: InputMaybe<FilterIs>;
};

/** Boolean expression comparing fields on type "Date" */
export type DateFilter = {
  eq?: InputMaybe<Scalars['Date']['input']>;
  gt?: InputMaybe<Scalars['Date']['input']>;
  gte?: InputMaybe<Scalars['Date']['input']>;
  in?: InputMaybe<Array<Scalars['Date']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Date']['input']>;
  lte?: InputMaybe<Scalars['Date']['input']>;
  neq?: InputMaybe<Scalars['Date']['input']>;
};

/** Boolean expression comparing fields on type "Datetime" */
export type DatetimeFilter = {
  eq?: InputMaybe<Scalars['Datetime']['input']>;
  gt?: InputMaybe<Scalars['Datetime']['input']>;
  gte?: InputMaybe<Scalars['Datetime']['input']>;
  in?: InputMaybe<Array<Scalars['Datetime']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Datetime']['input']>;
  lte?: InputMaybe<Scalars['Datetime']['input']>;
  neq?: InputMaybe<Scalars['Datetime']['input']>;
};

export enum FilterIs {
  NotNull = 'NOT_NULL',
  Null = 'NULL'
}

/** Boolean expression comparing fields on type "Float" */
export type FloatFilter = {
  eq?: InputMaybe<Scalars['Float']['input']>;
  gt?: InputMaybe<Scalars['Float']['input']>;
  gte?: InputMaybe<Scalars['Float']['input']>;
  in?: InputMaybe<Array<Scalars['Float']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Float']['input']>;
  lte?: InputMaybe<Scalars['Float']['input']>;
  neq?: InputMaybe<Scalars['Float']['input']>;
};

/** Boolean expression comparing fields on type "ID" */
export type IdFilter = {
  eq?: InputMaybe<Scalars['ID']['input']>;
};

/** Boolean expression comparing fields on type "Int" */
export type IntFilter = {
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  in?: InputMaybe<Array<Scalars['Int']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  neq?: InputMaybe<Scalars['Int']['input']>;
};

/** The root type for creating and mutating data */
export type Mutation = {
  __typename?: 'Mutation';
  /** Deletes zero or more records from the `completions` collection */
  deleteFromcompletionsCollection: CompletionsDeleteResponse;
  /** Deletes zero or more records from the `cross_pollinations` collection */
  deleteFromcross_pollinationsCollection: Cross_PollinationsDeleteResponse;
  /** Deletes zero or more records from the `events` collection */
  deleteFromeventsCollection: EventsDeleteResponse;
  /** Deletes zero or more records from the `messages` collection */
  deleteFrommessagesCollection: MessagesDeleteResponse;
  /** Deletes zero or more records from the `moderations` collection */
  deleteFrommoderationsCollection: ModerationsDeleteResponse;
  /** Deletes zero or more records from the `opinions` collection */
  deleteFromopinionsCollection: OpinionsDeleteResponse;
  /** Deletes zero or more records from the `outcome_sources` collection */
  deleteFromoutcome_sourcesCollection: Outcome_SourcesDeleteResponse;
  /** Deletes zero or more records from the `outcomes` collection */
  deleteFromoutcomesCollection: OutcomesDeleteResponse;
  /** Deletes zero or more records from the `participants` collection */
  deleteFromparticipantsCollection: ParticipantsDeleteResponse;
  /** Deletes zero or more records from the `rooms` collection */
  deleteFromroomsCollection: RoomsDeleteResponse;
  /** Deletes zero or more records from the `topics` collection */
  deleteFromtopicsCollection: TopicsDeleteResponse;
  /** Deletes zero or more records from the `users` collection */
  deleteFromusersCollection: UsersDeleteResponse;
  /** Adds one or more `completions` records to the collection */
  insertIntocompletionsCollection?: Maybe<CompletionsInsertResponse>;
  /** Adds one or more `cross_pollinations` records to the collection */
  insertIntocross_pollinationsCollection?: Maybe<Cross_PollinationsInsertResponse>;
  /** Adds one or more `events` records to the collection */
  insertIntoeventsCollection?: Maybe<EventsInsertResponse>;
  /** Adds one or more `messages` records to the collection */
  insertIntomessagesCollection?: Maybe<MessagesInsertResponse>;
  /** Adds one or more `moderations` records to the collection */
  insertIntomoderationsCollection?: Maybe<ModerationsInsertResponse>;
  /** Adds one or more `opinions` records to the collection */
  insertIntoopinionsCollection?: Maybe<OpinionsInsertResponse>;
  /** Adds one or more `outcome_sources` records to the collection */
  insertIntooutcome_sourcesCollection?: Maybe<Outcome_SourcesInsertResponse>;
  /** Adds one or more `outcomes` records to the collection */
  insertIntooutcomesCollection?: Maybe<OutcomesInsertResponse>;
  /** Adds one or more `participants` records to the collection */
  insertIntoparticipantsCollection?: Maybe<ParticipantsInsertResponse>;
  /** Adds one or more `rooms` records to the collection */
  insertIntoroomsCollection?: Maybe<RoomsInsertResponse>;
  /** Adds one or more `topics` records to the collection */
  insertIntotopicsCollection?: Maybe<TopicsInsertResponse>;
  /** Adds one or more `users` records to the collection */
  insertIntousersCollection?: Maybe<UsersInsertResponse>;
  /** Updates zero or more records in the `completions` collection */
  updatecompletionsCollection: CompletionsUpdateResponse;
  /** Updates zero or more records in the `cross_pollinations` collection */
  updatecross_pollinationsCollection: Cross_PollinationsUpdateResponse;
  /** Updates zero or more records in the `events` collection */
  updateeventsCollection: EventsUpdateResponse;
  /** Updates zero or more records in the `messages` collection */
  updatemessagesCollection: MessagesUpdateResponse;
  /** Updates zero or more records in the `moderations` collection */
  updatemoderationsCollection: ModerationsUpdateResponse;
  /** Updates zero or more records in the `opinions` collection */
  updateopinionsCollection: OpinionsUpdateResponse;
  /** Updates zero or more records in the `outcome_sources` collection */
  updateoutcome_sourcesCollection: Outcome_SourcesUpdateResponse;
  /** Updates zero or more records in the `outcomes` collection */
  updateoutcomesCollection: OutcomesUpdateResponse;
  /** Updates zero or more records in the `participants` collection */
  updateparticipantsCollection: ParticipantsUpdateResponse;
  /** Updates zero or more records in the `rooms` collection */
  updateroomsCollection: RoomsUpdateResponse;
  /** Updates zero or more records in the `topics` collection */
  updatetopicsCollection: TopicsUpdateResponse;
  /** Updates zero or more records in the `users` collection */
  updateusersCollection: UsersUpdateResponse;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromcompletionsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<CompletionsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromcross_PollinationsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Cross_PollinationsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromeventsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<EventsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFrommessagesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<MessagesFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFrommoderationsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<ModerationsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromopinionsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<OpinionsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromoutcome_SourcesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Outcome_SourcesFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromoutcomesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<OutcomesFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromparticipantsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<ParticipantsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromroomsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<RoomsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromtopicsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<TopicsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromusersCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<UsersFilter>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntocompletionsCollectionArgs = {
  objects: Array<CompletionsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntocross_PollinationsCollectionArgs = {
  objects: Array<Cross_PollinationsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoeventsCollectionArgs = {
  objects: Array<EventsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntomessagesCollectionArgs = {
  objects: Array<MessagesInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntomoderationsCollectionArgs = {
  objects: Array<ModerationsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoopinionsCollectionArgs = {
  objects: Array<OpinionsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntooutcome_SourcesCollectionArgs = {
  objects: Array<Outcome_SourcesInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntooutcomesCollectionArgs = {
  objects: Array<OutcomesInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoparticipantsCollectionArgs = {
  objects: Array<ParticipantsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoroomsCollectionArgs = {
  objects: Array<RoomsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntotopicsCollectionArgs = {
  objects: Array<TopicsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntousersCollectionArgs = {
  objects: Array<UsersInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationUpdatecompletionsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<CompletionsFilter>;
  set: CompletionsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatecross_PollinationsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Cross_PollinationsFilter>;
  set: Cross_PollinationsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateeventsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<EventsFilter>;
  set: EventsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatemessagesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<MessagesFilter>;
  set: MessagesUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatemoderationsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<ModerationsFilter>;
  set: ModerationsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateopinionsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<OpinionsFilter>;
  set: OpinionsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateoutcome_SourcesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Outcome_SourcesFilter>;
  set: Outcome_SourcesUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateoutcomesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<OutcomesFilter>;
  set: OutcomesUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateparticipantsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<ParticipantsFilter>;
  set: ParticipantsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateroomsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<RoomsFilter>;
  set: RoomsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatetopicsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<TopicsFilter>;
  set: TopicsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateusersCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<UsersFilter>;
  set: UsersUpdateInput;
};

export type Node = {
  /** Retrieves a record by `ID` */
  nodeId: Scalars['ID']['output'];
};

/** Boolean expression comparing fields on type "Opaque" */
export type OpaqueFilter = {
  eq?: InputMaybe<Scalars['Opaque']['input']>;
  is?: InputMaybe<FilterIs>;
};

/** Defines a per-field sorting order */
export enum OrderByDirection {
  /** Ascending order, nulls first */
  AscNullsFirst = 'AscNullsFirst',
  /** Ascending order, nulls last */
  AscNullsLast = 'AscNullsLast',
  /** Descending order, nulls first */
  DescNullsFirst = 'DescNullsFirst',
  /** Descending order, nulls last */
  DescNullsLast = 'DescNullsLast'
}

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

/** The root type for querying data */
export type Query = {
  __typename?: 'Query';
  /** A pagable collection of type `completions` */
  completionsCollection?: Maybe<CompletionsConnection>;
  /** A pagable collection of type `cross_pollinations` */
  cross_pollinationsCollection?: Maybe<Cross_PollinationsConnection>;
  /** A pagable collection of type `events` */
  eventsCollection?: Maybe<EventsConnection>;
  /** A pagable collection of type `messages` */
  messagesCollection?: Maybe<MessagesConnection>;
  /** A pagable collection of type `moderations` */
  moderationsCollection?: Maybe<ModerationsConnection>;
  /** Retrieve a record by its `ID` */
  node?: Maybe<Node>;
  /** A pagable collection of type `opinions` */
  opinionsCollection?: Maybe<OpinionsConnection>;
  /** A pagable collection of type `outcome_sources` */
  outcome_sourcesCollection?: Maybe<Outcome_SourcesConnection>;
  /** A pagable collection of type `outcomes` */
  outcomesCollection?: Maybe<OutcomesConnection>;
  /** A pagable collection of type `participants` */
  participantsCollection?: Maybe<ParticipantsConnection>;
  /** A pagable collection of type `rooms` */
  roomsCollection?: Maybe<RoomsConnection>;
  /** A pagable collection of type `topics` */
  topicsCollection?: Maybe<TopicsConnection>;
  /** A pagable collection of type `users` */
  usersCollection?: Maybe<UsersConnection>;
};


/** The root type for querying data */
export type QueryCompletionsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<CompletionsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<CompletionsOrderBy>>;
};


/** The root type for querying data */
export type QueryCross_PollinationsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Cross_PollinationsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Cross_PollinationsOrderBy>>;
};


/** The root type for querying data */
export type QueryEventsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<EventsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<EventsOrderBy>>;
};


/** The root type for querying data */
export type QueryMessagesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<MessagesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<MessagesOrderBy>>;
};


/** The root type for querying data */
export type QueryModerationsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ModerationsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ModerationsOrderBy>>;
};


/** The root type for querying data */
export type QueryNodeArgs = {
  nodeId: Scalars['ID']['input'];
};


/** The root type for querying data */
export type QueryOpinionsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<OpinionsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OpinionsOrderBy>>;
};


/** The root type for querying data */
export type QueryOutcome_SourcesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Outcome_SourcesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Outcome_SourcesOrderBy>>;
};


/** The root type for querying data */
export type QueryOutcomesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<OutcomesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OutcomesOrderBy>>;
};


/** The root type for querying data */
export type QueryParticipantsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ParticipantsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ParticipantsOrderBy>>;
};


/** The root type for querying data */
export type QueryRoomsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<RoomsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<RoomsOrderBy>>;
};


/** The root type for querying data */
export type QueryTopicsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<TopicsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<TopicsOrderBy>>;
};


/** The root type for querying data */
export type QueryUsersCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UsersFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<UsersOrderBy>>;
};

/** Boolean expression comparing fields on type "String" */
export type StringFilter = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<Array<Scalars['String']['input']>>;
  iregex?: InputMaybe<Scalars['String']['input']>;
  is?: InputMaybe<FilterIs>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  neq?: InputMaybe<Scalars['String']['input']>;
  regex?: InputMaybe<Scalars['String']['input']>;
  startsWith?: InputMaybe<Scalars['String']['input']>;
};

/** Boolean expression comparing fields on type "Time" */
export type TimeFilter = {
  eq?: InputMaybe<Scalars['Time']['input']>;
  gt?: InputMaybe<Scalars['Time']['input']>;
  gte?: InputMaybe<Scalars['Time']['input']>;
  in?: InputMaybe<Array<Scalars['Time']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Time']['input']>;
  lte?: InputMaybe<Scalars['Time']['input']>;
  neq?: InputMaybe<Scalars['Time']['input']>;
};

/** Boolean expression comparing fields on type "UUID" */
export type UuidFilter = {
  eq?: InputMaybe<Scalars['UUID']['input']>;
  in?: InputMaybe<Array<Scalars['UUID']['input']>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<Scalars['UUID']['input']>;
};

export enum CompletionType {
  Gpt = 'gpt',
  Gpt4 = 'gpt4'
}

/** Boolean expression comparing fields on type "completionType" */
export type CompletionTypeFilter = {
  eq?: InputMaybe<CompletionType>;
  in?: InputMaybe<Array<CompletionType>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<CompletionType>;
};

export type Completions = Node & {
  __typename?: 'completions';
  active: Scalars['Boolean']['output'];
  completion_id?: Maybe<Scalars['UUID']['output']>;
  completions?: Maybe<Completions>;
  completionsCollection?: Maybe<CompletionsConnection>;
  created_at: Scalars['Datetime']['output'];
  cross_pollination_id?: Maybe<Scalars['UUID']['output']>;
  cross_pollinations?: Maybe<Cross_Pollinations>;
  id: Scalars['UUID']['output'];
  message_id?: Maybe<Scalars['UUID']['output']>;
  messages?: Maybe<Messages>;
  model: Scalars['JSON']['output'];
  moderation_id?: Maybe<Scalars['UUID']['output']>;
  moderations?: Maybe<Moderations>;
  moderationsCollection?: Maybe<ModerationsConnection>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  opinion_id?: Maybe<Scalars['UUID']['output']>;
  opinions?: Maybe<Opinions>;
  outcome_id?: Maybe<Scalars['UUID']['output']>;
  outcomes?: Maybe<Outcomes>;
  participant_id?: Maybe<Scalars['UUID']['output']>;
  participants?: Maybe<Participants>;
  prompt: Scalars['String']['output'];
  room_id?: Maybe<Scalars['UUID']['output']>;
  rooms?: Maybe<Rooms>;
  target_type?: Maybe<TargetType>;
  topic_id?: Maybe<Scalars['UUID']['output']>;
  topics?: Maybe<Topics>;
  type: CompletionType;
  updated_at: Scalars['Datetime']['output'];
  user_id?: Maybe<Scalars['UUID']['output']>;
  users?: Maybe<Users>;
  variables: Scalars['JSON']['output'];
};


export type CompletionsCompletionsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<CompletionsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<CompletionsOrderBy>>;
};


export type CompletionsModerationsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ModerationsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ModerationsOrderBy>>;
};

export type CompletionsConnection = {
  __typename?: 'completionsConnection';
  edges: Array<CompletionsEdge>;
  pageInfo: PageInfo;
};

export type CompletionsDeleteResponse = {
  __typename?: 'completionsDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Completions>;
};

export type CompletionsEdge = {
  __typename?: 'completionsEdge';
  cursor: Scalars['String']['output'];
  node: Completions;
};

export type CompletionsFilter = {
  active?: InputMaybe<BooleanFilter>;
  completion_id?: InputMaybe<UuidFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  cross_pollination_id?: InputMaybe<UuidFilter>;
  id?: InputMaybe<UuidFilter>;
  message_id?: InputMaybe<UuidFilter>;
  moderation_id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  opinion_id?: InputMaybe<UuidFilter>;
  outcome_id?: InputMaybe<UuidFilter>;
  participant_id?: InputMaybe<UuidFilter>;
  prompt?: InputMaybe<StringFilter>;
  room_id?: InputMaybe<UuidFilter>;
  target_type?: InputMaybe<TargetTypeFilter>;
  topic_id?: InputMaybe<UuidFilter>;
  type?: InputMaybe<CompletionTypeFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type CompletionsInsertInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  completion_id?: InputMaybe<Scalars['UUID']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  cross_pollination_id?: InputMaybe<Scalars['UUID']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  message_id?: InputMaybe<Scalars['UUID']['input']>;
  model?: InputMaybe<Scalars['JSON']['input']>;
  moderation_id?: InputMaybe<Scalars['UUID']['input']>;
  opinion_id?: InputMaybe<Scalars['UUID']['input']>;
  outcome_id?: InputMaybe<Scalars['UUID']['input']>;
  participant_id?: InputMaybe<Scalars['UUID']['input']>;
  prompt?: InputMaybe<Scalars['String']['input']>;
  room_id?: InputMaybe<Scalars['UUID']['input']>;
  target_type?: InputMaybe<TargetType>;
  topic_id?: InputMaybe<Scalars['UUID']['input']>;
  type?: InputMaybe<CompletionType>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
  variables?: InputMaybe<Scalars['JSON']['input']>;
};

export type CompletionsInsertResponse = {
  __typename?: 'completionsInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Completions>;
};

export type CompletionsOrderBy = {
  active?: InputMaybe<OrderByDirection>;
  completion_id?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  cross_pollination_id?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  message_id?: InputMaybe<OrderByDirection>;
  moderation_id?: InputMaybe<OrderByDirection>;
  opinion_id?: InputMaybe<OrderByDirection>;
  outcome_id?: InputMaybe<OrderByDirection>;
  participant_id?: InputMaybe<OrderByDirection>;
  prompt?: InputMaybe<OrderByDirection>;
  room_id?: InputMaybe<OrderByDirection>;
  target_type?: InputMaybe<OrderByDirection>;
  topic_id?: InputMaybe<OrderByDirection>;
  type?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
};

export type CompletionsUpdateInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  completion_id?: InputMaybe<Scalars['UUID']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  cross_pollination_id?: InputMaybe<Scalars['UUID']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  message_id?: InputMaybe<Scalars['UUID']['input']>;
  model?: InputMaybe<Scalars['JSON']['input']>;
  moderation_id?: InputMaybe<Scalars['UUID']['input']>;
  opinion_id?: InputMaybe<Scalars['UUID']['input']>;
  outcome_id?: InputMaybe<Scalars['UUID']['input']>;
  participant_id?: InputMaybe<Scalars['UUID']['input']>;
  prompt?: InputMaybe<Scalars['String']['input']>;
  room_id?: InputMaybe<Scalars['UUID']['input']>;
  target_type?: InputMaybe<TargetType>;
  topic_id?: InputMaybe<Scalars['UUID']['input']>;
  type?: InputMaybe<CompletionType>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
  variables?: InputMaybe<Scalars['JSON']['input']>;
};

export type CompletionsUpdateResponse = {
  __typename?: 'completionsUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Completions>;
};

export enum CrossPollinationType {
  Outcome = 'outcome',
  Topic = 'topic'
}

/** Boolean expression comparing fields on type "crossPollinationType" */
export type CrossPollinationTypeFilter = {
  eq?: InputMaybe<CrossPollinationType>;
  in?: InputMaybe<Array<CrossPollinationType>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<CrossPollinationType>;
};

export type Cross_Pollinations = Node & {
  __typename?: 'cross_pollinations';
  active: Scalars['Boolean']['output'];
  completionsCollection?: Maybe<CompletionsConnection>;
  created_at: Scalars['Datetime']['output'];
  id: Scalars['UUID']['output'];
  moderationsCollection?: Maybe<ModerationsConnection>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  outcome_id?: Maybe<Scalars['UUID']['output']>;
  outcomes?: Maybe<Outcomes>;
  participant_id?: Maybe<Scalars['UUID']['output']>;
  participants?: Maybe<Participants>;
  room_id?: Maybe<Scalars['UUID']['output']>;
  rooms?: Maybe<Rooms>;
  timing_type: TimingType;
  topic_id?: Maybe<Scalars['UUID']['output']>;
  topics?: Maybe<Topics>;
  type: CrossPollinationType;
  updated_at: Scalars['Datetime']['output'];
  user_id?: Maybe<Scalars['UUID']['output']>;
  users?: Maybe<Users>;
};


export type Cross_PollinationsCompletionsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<CompletionsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<CompletionsOrderBy>>;
};


export type Cross_PollinationsModerationsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ModerationsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ModerationsOrderBy>>;
};

export type Cross_PollinationsConnection = {
  __typename?: 'cross_pollinationsConnection';
  edges: Array<Cross_PollinationsEdge>;
  pageInfo: PageInfo;
};

export type Cross_PollinationsDeleteResponse = {
  __typename?: 'cross_pollinationsDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Cross_Pollinations>;
};

export type Cross_PollinationsEdge = {
  __typename?: 'cross_pollinationsEdge';
  cursor: Scalars['String']['output'];
  node: Cross_Pollinations;
};

export type Cross_PollinationsFilter = {
  active?: InputMaybe<BooleanFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  outcome_id?: InputMaybe<UuidFilter>;
  participant_id?: InputMaybe<UuidFilter>;
  room_id?: InputMaybe<UuidFilter>;
  timing_type?: InputMaybe<TimingTypeFilter>;
  topic_id?: InputMaybe<UuidFilter>;
  type?: InputMaybe<CrossPollinationTypeFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type Cross_PollinationsInsertInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  outcome_id?: InputMaybe<Scalars['UUID']['input']>;
  participant_id?: InputMaybe<Scalars['UUID']['input']>;
  room_id?: InputMaybe<Scalars['UUID']['input']>;
  timing_type?: InputMaybe<TimingType>;
  topic_id?: InputMaybe<Scalars['UUID']['input']>;
  type?: InputMaybe<CrossPollinationType>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Cross_PollinationsInsertResponse = {
  __typename?: 'cross_pollinationsInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Cross_Pollinations>;
};

export type Cross_PollinationsOrderBy = {
  active?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  outcome_id?: InputMaybe<OrderByDirection>;
  participant_id?: InputMaybe<OrderByDirection>;
  room_id?: InputMaybe<OrderByDirection>;
  timing_type?: InputMaybe<OrderByDirection>;
  topic_id?: InputMaybe<OrderByDirection>;
  type?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
};

export type Cross_PollinationsUpdateInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  outcome_id?: InputMaybe<Scalars['UUID']['input']>;
  participant_id?: InputMaybe<Scalars['UUID']['input']>;
  room_id?: InputMaybe<Scalars['UUID']['input']>;
  timing_type?: InputMaybe<TimingType>;
  topic_id?: InputMaybe<Scalars['UUID']['input']>;
  type?: InputMaybe<CrossPollinationType>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Cross_PollinationsUpdateResponse = {
  __typename?: 'cross_pollinationsUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Cross_Pollinations>;
};

export type Events = Node & {
  __typename?: 'events';
  active: Scalars['Boolean']['output'];
  created_at: Scalars['Datetime']['output'];
  ends_at?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['UUID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  starts_at?: Maybe<Scalars['Datetime']['output']>;
  updated_at: Scalars['Datetime']['output'];
};

export type EventsConnection = {
  __typename?: 'eventsConnection';
  edges: Array<EventsEdge>;
  pageInfo: PageInfo;
};

export type EventsDeleteResponse = {
  __typename?: 'eventsDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Events>;
};

export type EventsEdge = {
  __typename?: 'eventsEdge';
  cursor: Scalars['String']['output'];
  node: Events;
};

export type EventsFilter = {
  active?: InputMaybe<BooleanFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  ends_at?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  name?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  starts_at?: InputMaybe<DatetimeFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
};

export type EventsInsertInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  ends_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  starts_at?: InputMaybe<Scalars['Datetime']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type EventsInsertResponse = {
  __typename?: 'eventsInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Events>;
};

export type EventsOrderBy = {
  active?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  ends_at?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  name?: InputMaybe<OrderByDirection>;
  starts_at?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
};

export type EventsUpdateInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  ends_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  starts_at?: InputMaybe<Scalars['Datetime']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type EventsUpdateResponse = {
  __typename?: 'eventsUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Events>;
};

export enum MessageType {
  Bot = 'bot',
  Chat = 'chat',
  Voice = 'voice'
}

/** Boolean expression comparing fields on type "messageType" */
export type MessageTypeFilter = {
  eq?: InputMaybe<MessageType>;
  in?: InputMaybe<Array<MessageType>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<MessageType>;
};

export type Messages = Node & {
  __typename?: 'messages';
  active: Scalars['Boolean']['output'];
  completionsCollection?: Maybe<CompletionsConnection>;
  content: Scalars['String']['output'];
  created_at: Scalars['Datetime']['output'];
  easy_language?: Maybe<Scalars['Boolean']['output']>;
  embeddings: Scalars['JSON']['output'];
  id: Scalars['UUID']['output'];
  messages?: Maybe<Messages>;
  messagesCollection?: Maybe<MessagesConnection>;
  moderationsCollection?: Maybe<ModerationsConnection>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  original_message_id?: Maybe<Scalars['UUID']['output']>;
  outcome_sourcesCollection?: Maybe<Outcome_SourcesConnection>;
  participant_id?: Maybe<Scalars['UUID']['output']>;
  participants?: Maybe<Participants>;
  room_id?: Maybe<Scalars['UUID']['output']>;
  room_status_type?: Maybe<RoomStatusType>;
  rooms?: Maybe<Rooms>;
  safe_language?: Maybe<Scalars['Boolean']['output']>;
  timing_type: TimingType;
  type: MessageType;
  updated_at: Scalars['Datetime']['output'];
  visibility_type: VisibilityType;
};


export type MessagesCompletionsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<CompletionsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<CompletionsOrderBy>>;
};


export type MessagesMessagesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<MessagesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<MessagesOrderBy>>;
};


export type MessagesModerationsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ModerationsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ModerationsOrderBy>>;
};


export type MessagesOutcome_SourcesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Outcome_SourcesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Outcome_SourcesOrderBy>>;
};

export type MessagesConnection = {
  __typename?: 'messagesConnection';
  edges: Array<MessagesEdge>;
  pageInfo: PageInfo;
};

export type MessagesDeleteResponse = {
  __typename?: 'messagesDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Messages>;
};

export type MessagesEdge = {
  __typename?: 'messagesEdge';
  cursor: Scalars['String']['output'];
  node: Messages;
};

export type MessagesFilter = {
  active?: InputMaybe<BooleanFilter>;
  content?: InputMaybe<StringFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  easy_language?: InputMaybe<BooleanFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  original_message_id?: InputMaybe<UuidFilter>;
  participant_id?: InputMaybe<UuidFilter>;
  room_id?: InputMaybe<UuidFilter>;
  room_status_type?: InputMaybe<RoomStatusTypeFilter>;
  safe_language?: InputMaybe<BooleanFilter>;
  timing_type?: InputMaybe<TimingTypeFilter>;
  type?: InputMaybe<MessageTypeFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  visibility_type?: InputMaybe<VisibilityTypeFilter>;
};

export type MessagesInsertInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  content?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  easy_language?: InputMaybe<Scalars['Boolean']['input']>;
  embeddings?: InputMaybe<Scalars['JSON']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  original_message_id?: InputMaybe<Scalars['UUID']['input']>;
  participant_id?: InputMaybe<Scalars['UUID']['input']>;
  room_id?: InputMaybe<Scalars['UUID']['input']>;
  room_status_type?: InputMaybe<RoomStatusType>;
  safe_language?: InputMaybe<Scalars['Boolean']['input']>;
  timing_type?: InputMaybe<TimingType>;
  type?: InputMaybe<MessageType>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  visibility_type?: InputMaybe<VisibilityType>;
};

export type MessagesInsertResponse = {
  __typename?: 'messagesInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Messages>;
};

export type MessagesOrderBy = {
  active?: InputMaybe<OrderByDirection>;
  content?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  easy_language?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  original_message_id?: InputMaybe<OrderByDirection>;
  participant_id?: InputMaybe<OrderByDirection>;
  room_id?: InputMaybe<OrderByDirection>;
  room_status_type?: InputMaybe<OrderByDirection>;
  safe_language?: InputMaybe<OrderByDirection>;
  timing_type?: InputMaybe<OrderByDirection>;
  type?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  visibility_type?: InputMaybe<OrderByDirection>;
};

export type MessagesUpdateInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  content?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  easy_language?: InputMaybe<Scalars['Boolean']['input']>;
  embeddings?: InputMaybe<Scalars['JSON']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  original_message_id?: InputMaybe<Scalars['UUID']['input']>;
  participant_id?: InputMaybe<Scalars['UUID']['input']>;
  room_id?: InputMaybe<Scalars['UUID']['input']>;
  room_status_type?: InputMaybe<RoomStatusType>;
  safe_language?: InputMaybe<Scalars['Boolean']['input']>;
  timing_type?: InputMaybe<TimingType>;
  type?: InputMaybe<MessageType>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  visibility_type?: InputMaybe<VisibilityType>;
};

export type MessagesUpdateResponse = {
  __typename?: 'messagesUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Messages>;
};

export enum ModerationType {
  Clarification = 'clarification',
  Consensus = 'consensus',
  Harrashment = 'harrashment',
  OffTopic = 'off_topic',
  Other = 'other',
  Spam = 'spam',
  Unequal = 'unequal'
}

/** Boolean expression comparing fields on type "moderationType" */
export type ModerationTypeFilter = {
  eq?: InputMaybe<ModerationType>;
  in?: InputMaybe<Array<ModerationType>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<ModerationType>;
};

export type Moderations = Node & {
  __typename?: 'moderations';
  active: Scalars['Boolean']['output'];
  completed_at?: Maybe<Scalars['Datetime']['output']>;
  completion_id?: Maybe<Scalars['UUID']['output']>;
  completions?: Maybe<Completions>;
  completionsCollection?: Maybe<CompletionsConnection>;
  created_at: Scalars['Datetime']['output'];
  cross_pollination_id?: Maybe<Scalars['UUID']['output']>;
  cross_pollinations?: Maybe<Cross_Pollinations>;
  id: Scalars['UUID']['output'];
  job_key?: Maybe<Scalars['String']['output']>;
  message_id?: Maybe<Scalars['UUID']['output']>;
  messages?: Maybe<Messages>;
  moderation_id?: Maybe<Scalars['UUID']['output']>;
  moderations?: Maybe<Moderations>;
  moderationsCollection?: Maybe<ModerationsConnection>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  opinion_id?: Maybe<Scalars['UUID']['output']>;
  opinions?: Maybe<Opinions>;
  outcome_id?: Maybe<Scalars['UUID']['output']>;
  outcomes?: Maybe<Outcomes>;
  participant_id?: Maybe<Scalars['UUID']['output']>;
  participants?: Maybe<Participants>;
  result: Scalars['JSON']['output'];
  room_id?: Maybe<Scalars['UUID']['output']>;
  rooms?: Maybe<Rooms>;
  statement?: Maybe<Scalars['String']['output']>;
  target_type?: Maybe<TargetType>;
  topic_id?: Maybe<Scalars['UUID']['output']>;
  topics?: Maybe<Topics>;
  type: Scalars['String']['output'];
  updated_at: Scalars['Datetime']['output'];
  user_id?: Maybe<Scalars['UUID']['output']>;
  users?: Maybe<Users>;
};


export type ModerationsCompletionsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<CompletionsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<CompletionsOrderBy>>;
};


export type ModerationsModerationsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ModerationsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ModerationsOrderBy>>;
};

export type ModerationsConnection = {
  __typename?: 'moderationsConnection';
  edges: Array<ModerationsEdge>;
  pageInfo: PageInfo;
};

export type ModerationsDeleteResponse = {
  __typename?: 'moderationsDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Moderations>;
};

export type ModerationsEdge = {
  __typename?: 'moderationsEdge';
  cursor: Scalars['String']['output'];
  node: Moderations;
};

export type ModerationsFilter = {
  active?: InputMaybe<BooleanFilter>;
  completed_at?: InputMaybe<DatetimeFilter>;
  completion_id?: InputMaybe<UuidFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  cross_pollination_id?: InputMaybe<UuidFilter>;
  id?: InputMaybe<UuidFilter>;
  job_key?: InputMaybe<StringFilter>;
  message_id?: InputMaybe<UuidFilter>;
  moderation_id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  opinion_id?: InputMaybe<UuidFilter>;
  outcome_id?: InputMaybe<UuidFilter>;
  participant_id?: InputMaybe<UuidFilter>;
  room_id?: InputMaybe<UuidFilter>;
  statement?: InputMaybe<StringFilter>;
  target_type?: InputMaybe<TargetTypeFilter>;
  topic_id?: InputMaybe<UuidFilter>;
  type?: InputMaybe<StringFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type ModerationsInsertInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  completed_at?: InputMaybe<Scalars['Datetime']['input']>;
  completion_id?: InputMaybe<Scalars['UUID']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  cross_pollination_id?: InputMaybe<Scalars['UUID']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  job_key?: InputMaybe<Scalars['String']['input']>;
  message_id?: InputMaybe<Scalars['UUID']['input']>;
  moderation_id?: InputMaybe<Scalars['UUID']['input']>;
  opinion_id?: InputMaybe<Scalars['UUID']['input']>;
  outcome_id?: InputMaybe<Scalars['UUID']['input']>;
  participant_id?: InputMaybe<Scalars['UUID']['input']>;
  result?: InputMaybe<Scalars['JSON']['input']>;
  room_id?: InputMaybe<Scalars['UUID']['input']>;
  statement?: InputMaybe<Scalars['String']['input']>;
  target_type?: InputMaybe<TargetType>;
  topic_id?: InputMaybe<Scalars['UUID']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type ModerationsInsertResponse = {
  __typename?: 'moderationsInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Moderations>;
};

export type ModerationsOrderBy = {
  active?: InputMaybe<OrderByDirection>;
  completed_at?: InputMaybe<OrderByDirection>;
  completion_id?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  cross_pollination_id?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  job_key?: InputMaybe<OrderByDirection>;
  message_id?: InputMaybe<OrderByDirection>;
  moderation_id?: InputMaybe<OrderByDirection>;
  opinion_id?: InputMaybe<OrderByDirection>;
  outcome_id?: InputMaybe<OrderByDirection>;
  participant_id?: InputMaybe<OrderByDirection>;
  room_id?: InputMaybe<OrderByDirection>;
  statement?: InputMaybe<OrderByDirection>;
  target_type?: InputMaybe<OrderByDirection>;
  topic_id?: InputMaybe<OrderByDirection>;
  type?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
};

export type ModerationsUpdateInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  completed_at?: InputMaybe<Scalars['Datetime']['input']>;
  completion_id?: InputMaybe<Scalars['UUID']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  cross_pollination_id?: InputMaybe<Scalars['UUID']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  job_key?: InputMaybe<Scalars['String']['input']>;
  message_id?: InputMaybe<Scalars['UUID']['input']>;
  moderation_id?: InputMaybe<Scalars['UUID']['input']>;
  opinion_id?: InputMaybe<Scalars['UUID']['input']>;
  outcome_id?: InputMaybe<Scalars['UUID']['input']>;
  participant_id?: InputMaybe<Scalars['UUID']['input']>;
  result?: InputMaybe<Scalars['JSON']['input']>;
  room_id?: InputMaybe<Scalars['UUID']['input']>;
  statement?: InputMaybe<Scalars['String']['input']>;
  target_type?: InputMaybe<TargetType>;
  topic_id?: InputMaybe<Scalars['UUID']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type ModerationsUpdateResponse = {
  __typename?: 'moderationsUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Moderations>;
};

export enum OpinionOptionType {
  Agree = 'agree',
  AgreeConsensus = 'agree_consensus',
  Disagree = 'disagree',
  DisagreeConsensus = 'disagree_consensus',
  Negative = 'negative',
  Neutral = 'neutral',
  Positive = 'positive',
  Wrong = 'wrong'
}

/** Boolean expression comparing fields on type "opinionOptionType" */
export type OpinionOptionTypeFilter = {
  eq?: InputMaybe<OpinionOptionType>;
  in?: InputMaybe<Array<OpinionOptionType>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<OpinionOptionType>;
};

export enum OpinionType {
  AgreementRange = 'agreement_range',
  Option = 'option',
  RelevanceRange = 'relevance_range',
  Statement = 'statement'
}

/** Boolean expression comparing fields on type "opinionType" */
export type OpinionTypeFilter = {
  eq?: InputMaybe<OpinionType>;
  in?: InputMaybe<Array<OpinionType>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<OpinionType>;
};

export type Opinions = Node & {
  __typename?: 'opinions';
  active: Scalars['Boolean']['output'];
  completionsCollection?: Maybe<CompletionsConnection>;
  created_at: Scalars['Datetime']['output'];
  id: Scalars['UUID']['output'];
  moderationsCollection?: Maybe<ModerationsConnection>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  option_type?: Maybe<OpinionOptionType>;
  outcome_id?: Maybe<Scalars['UUID']['output']>;
  outcomes?: Maybe<Outcomes>;
  participant_id: Scalars['UUID']['output'];
  participants: Participants;
  range_value: Scalars['Int']['output'];
  statement: Scalars['String']['output'];
  type: OpinionType;
  updated_at: Scalars['Datetime']['output'];
};


export type OpinionsCompletionsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<CompletionsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<CompletionsOrderBy>>;
};


export type OpinionsModerationsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ModerationsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ModerationsOrderBy>>;
};

export type OpinionsConnection = {
  __typename?: 'opinionsConnection';
  edges: Array<OpinionsEdge>;
  pageInfo: PageInfo;
};

export type OpinionsDeleteResponse = {
  __typename?: 'opinionsDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Opinions>;
};

export type OpinionsEdge = {
  __typename?: 'opinionsEdge';
  cursor: Scalars['String']['output'];
  node: Opinions;
};

export type OpinionsFilter = {
  active?: InputMaybe<BooleanFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  option_type?: InputMaybe<OpinionOptionTypeFilter>;
  outcome_id?: InputMaybe<UuidFilter>;
  participant_id?: InputMaybe<UuidFilter>;
  range_value?: InputMaybe<IntFilter>;
  statement?: InputMaybe<StringFilter>;
  type?: InputMaybe<OpinionTypeFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
};

export type OpinionsInsertInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  option_type?: InputMaybe<OpinionOptionType>;
  outcome_id?: InputMaybe<Scalars['UUID']['input']>;
  participant_id?: InputMaybe<Scalars['UUID']['input']>;
  range_value?: InputMaybe<Scalars['Int']['input']>;
  statement?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<OpinionType>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type OpinionsInsertResponse = {
  __typename?: 'opinionsInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Opinions>;
};

export type OpinionsOrderBy = {
  active?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  option_type?: InputMaybe<OrderByDirection>;
  outcome_id?: InputMaybe<OrderByDirection>;
  participant_id?: InputMaybe<OrderByDirection>;
  range_value?: InputMaybe<OrderByDirection>;
  statement?: InputMaybe<OrderByDirection>;
  type?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
};

export type OpinionsUpdateInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  option_type?: InputMaybe<OpinionOptionType>;
  outcome_id?: InputMaybe<Scalars['UUID']['input']>;
  participant_id?: InputMaybe<Scalars['UUID']['input']>;
  range_value?: InputMaybe<Scalars['Int']['input']>;
  statement?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<OpinionType>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type OpinionsUpdateResponse = {
  __typename?: 'opinionsUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Opinions>;
};

export enum OutcomeType {
  Consensus = 'consensus',
  Milestone = 'milestone',
  OffTopic = 'off_topic',
  OverallImpression = 'overall_impression',
  TopicInterest = 'topic_interest'
}

/** Boolean expression comparing fields on type "outcomeType" */
export type OutcomeTypeFilter = {
  eq?: InputMaybe<OutcomeType>;
  in?: InputMaybe<Array<OutcomeType>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<OutcomeType>;
};

export type Outcome_Sources = Node & {
  __typename?: 'outcome_sources';
  active: Scalars['Boolean']['output'];
  created_at: Scalars['Datetime']['output'];
  id: Scalars['UUID']['output'];
  message_id: Scalars['UUID']['output'];
  messages: Messages;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  outcome_id: Scalars['UUID']['output'];
  outcomes: Outcomes;
  updated_at: Scalars['Datetime']['output'];
};

export type Outcome_SourcesConnection = {
  __typename?: 'outcome_sourcesConnection';
  edges: Array<Outcome_SourcesEdge>;
  pageInfo: PageInfo;
};

export type Outcome_SourcesDeleteResponse = {
  __typename?: 'outcome_sourcesDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Outcome_Sources>;
};

export type Outcome_SourcesEdge = {
  __typename?: 'outcome_sourcesEdge';
  cursor: Scalars['String']['output'];
  node: Outcome_Sources;
};

export type Outcome_SourcesFilter = {
  active?: InputMaybe<BooleanFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  message_id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  outcome_id?: InputMaybe<UuidFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
};

export type Outcome_SourcesInsertInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  message_id?: InputMaybe<Scalars['UUID']['input']>;
  outcome_id?: InputMaybe<Scalars['UUID']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type Outcome_SourcesInsertResponse = {
  __typename?: 'outcome_sourcesInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Outcome_Sources>;
};

export type Outcome_SourcesOrderBy = {
  active?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  message_id?: InputMaybe<OrderByDirection>;
  outcome_id?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
};

export type Outcome_SourcesUpdateInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  message_id?: InputMaybe<Scalars['UUID']['input']>;
  outcome_id?: InputMaybe<Scalars['UUID']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type Outcome_SourcesUpdateResponse = {
  __typename?: 'outcome_sourcesUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Outcome_Sources>;
};

export type Outcomes = Node & {
  __typename?: 'outcomes';
  active: Scalars['Boolean']['output'];
  completionsCollection?: Maybe<CompletionsConnection>;
  content: Scalars['String']['output'];
  created_at: Scalars['Datetime']['output'];
  cross_pollinationsCollection?: Maybe<Cross_PollinationsConnection>;
  id: Scalars['UUID']['output'];
  moderationsCollection?: Maybe<ModerationsConnection>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  opinionsCollection?: Maybe<OpinionsConnection>;
  original_outcome_id?: Maybe<Scalars['UUID']['output']>;
  outcome_sourcesCollection?: Maybe<Outcome_SourcesConnection>;
  outcomes?: Maybe<Outcomes>;
  outcomesCollection?: Maybe<OutcomesConnection>;
  room_id?: Maybe<Scalars['UUID']['output']>;
  rooms?: Maybe<Rooms>;
  type: OutcomeType;
  updated_at: Scalars['Datetime']['output'];
};


export type OutcomesCompletionsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<CompletionsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<CompletionsOrderBy>>;
};


export type OutcomesCross_PollinationsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Cross_PollinationsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Cross_PollinationsOrderBy>>;
};


export type OutcomesModerationsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ModerationsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ModerationsOrderBy>>;
};


export type OutcomesOpinionsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<OpinionsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OpinionsOrderBy>>;
};


export type OutcomesOutcome_SourcesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Outcome_SourcesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Outcome_SourcesOrderBy>>;
};


export type OutcomesOutcomesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<OutcomesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OutcomesOrderBy>>;
};

export type OutcomesConnection = {
  __typename?: 'outcomesConnection';
  edges: Array<OutcomesEdge>;
  pageInfo: PageInfo;
};

export type OutcomesDeleteResponse = {
  __typename?: 'outcomesDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Outcomes>;
};

export type OutcomesEdge = {
  __typename?: 'outcomesEdge';
  cursor: Scalars['String']['output'];
  node: Outcomes;
};

export type OutcomesFilter = {
  active?: InputMaybe<BooleanFilter>;
  content?: InputMaybe<StringFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  original_outcome_id?: InputMaybe<UuidFilter>;
  room_id?: InputMaybe<UuidFilter>;
  type?: InputMaybe<OutcomeTypeFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
};

export type OutcomesInsertInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  content?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  original_outcome_id?: InputMaybe<Scalars['UUID']['input']>;
  room_id?: InputMaybe<Scalars['UUID']['input']>;
  type?: InputMaybe<OutcomeType>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type OutcomesInsertResponse = {
  __typename?: 'outcomesInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Outcomes>;
};

export type OutcomesOrderBy = {
  active?: InputMaybe<OrderByDirection>;
  content?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  original_outcome_id?: InputMaybe<OrderByDirection>;
  room_id?: InputMaybe<OrderByDirection>;
  type?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
};

export type OutcomesUpdateInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  content?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  original_outcome_id?: InputMaybe<Scalars['UUID']['input']>;
  room_id?: InputMaybe<Scalars['UUID']['input']>;
  type?: InputMaybe<OutcomeType>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type OutcomesUpdateResponse = {
  __typename?: 'outcomesUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Outcomes>;
};

export enum ParticipantStatusType {
  EndOfSession = 'end_of_session',
  InRoom = 'in_room',
  Queued = 'queued',
  TransferingToRoom = 'transfering_to_room',
  WaitingForConfirmation = 'waiting_for_confirmation'
}

/** Boolean expression comparing fields on type "participantStatusType" */
export type ParticipantStatusTypeFilter = {
  eq?: InputMaybe<ParticipantStatusType>;
  in?: InputMaybe<Array<ParticipantStatusType>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<ParticipantStatusType>;
};

export type Participants = Node & {
  __typename?: 'participants';
  active: Scalars['Boolean']['output'];
  completionsCollection?: Maybe<CompletionsConnection>;
  created_at: Scalars['Datetime']['output'];
  cross_pollinationsCollection?: Maybe<Cross_PollinationsConnection>;
  demographics: Scalars['JSON']['output'];
  id: Scalars['UUID']['output'];
  last_seen_at: Scalars['Datetime']['output'];
  messagesCollection?: Maybe<MessagesConnection>;
  moderationsCollection?: Maybe<ModerationsConnection>;
  nick_name: Scalars['String']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  opinionsCollection?: Maybe<OpinionsConnection>;
  participation_score: Scalars['Int']['output'];
  room_id?: Maybe<Scalars['UUID']['output']>;
  rooms?: Maybe<Rooms>;
  status: ParticipantStatusType;
  updated_at: Scalars['Datetime']['output'];
  user_id?: Maybe<Scalars['UUID']['output']>;
  users?: Maybe<Users>;
};


export type ParticipantsCompletionsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<CompletionsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<CompletionsOrderBy>>;
};


export type ParticipantsCross_PollinationsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Cross_PollinationsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Cross_PollinationsOrderBy>>;
};


export type ParticipantsMessagesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<MessagesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<MessagesOrderBy>>;
};


export type ParticipantsModerationsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ModerationsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ModerationsOrderBy>>;
};


export type ParticipantsOpinionsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<OpinionsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OpinionsOrderBy>>;
};

export type ParticipantsConnection = {
  __typename?: 'participantsConnection';
  edges: Array<ParticipantsEdge>;
  pageInfo: PageInfo;
};

export type ParticipantsDeleteResponse = {
  __typename?: 'participantsDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Participants>;
};

export type ParticipantsEdge = {
  __typename?: 'participantsEdge';
  cursor: Scalars['String']['output'];
  node: Participants;
};

export type ParticipantsFilter = {
  active?: InputMaybe<BooleanFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  last_seen_at?: InputMaybe<DatetimeFilter>;
  nick_name?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  participation_score?: InputMaybe<IntFilter>;
  room_id?: InputMaybe<UuidFilter>;
  status?: InputMaybe<ParticipantStatusTypeFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type ParticipantsInsertInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  demographics?: InputMaybe<Scalars['JSON']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  last_seen_at?: InputMaybe<Scalars['Datetime']['input']>;
  nick_name?: InputMaybe<Scalars['String']['input']>;
  participation_score?: InputMaybe<Scalars['Int']['input']>;
  room_id?: InputMaybe<Scalars['UUID']['input']>;
  status?: InputMaybe<ParticipantStatusType>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type ParticipantsInsertResponse = {
  __typename?: 'participantsInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Participants>;
};

export type ParticipantsOrderBy = {
  active?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  last_seen_at?: InputMaybe<OrderByDirection>;
  nick_name?: InputMaybe<OrderByDirection>;
  participation_score?: InputMaybe<OrderByDirection>;
  room_id?: InputMaybe<OrderByDirection>;
  status?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
};

export type ParticipantsUpdateInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  demographics?: InputMaybe<Scalars['JSON']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  last_seen_at?: InputMaybe<Scalars['Datetime']['input']>;
  nick_name?: InputMaybe<Scalars['String']['input']>;
  participation_score?: InputMaybe<Scalars['Int']['input']>;
  room_id?: InputMaybe<Scalars['UUID']['input']>;
  status?: InputMaybe<ParticipantStatusType>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type ParticipantsUpdateResponse = {
  __typename?: 'participantsUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Participants>;
};

export enum RoomStatusType {
  Close = 'close',
  Debate = 'debate',
  End = 'end',
  GroupIntro = 'group_intro',
  Informed = 'informed',
  Results = 'results',
  Safe = 'safe',
  TopicIntro = 'topic_intro'
}

/** Boolean expression comparing fields on type "roomStatusType" */
export type RoomStatusTypeFilter = {
  eq?: InputMaybe<RoomStatusType>;
  in?: InputMaybe<Array<RoomStatusType>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<RoomStatusType>;
};

export type Rooms = Node & {
  __typename?: 'rooms';
  active: Scalars['Boolean']['output'];
  completionsCollection?: Maybe<CompletionsConnection>;
  created_at: Scalars['Datetime']['output'];
  cross_pollinationsCollection?: Maybe<Cross_PollinationsConnection>;
  external_room_id?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  messagesCollection?: Maybe<MessagesConnection>;
  moderationsCollection?: Maybe<ModerationsConnection>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  outcomesCollection?: Maybe<OutcomesConnection>;
  participantsCollection?: Maybe<ParticipantsConnection>;
  starts_at?: Maybe<Scalars['Datetime']['output']>;
  status_type: RoomStatusType;
  topic_id: Scalars['UUID']['output'];
  topics: Topics;
  updated_at: Scalars['Datetime']['output'];
};


export type RoomsCompletionsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<CompletionsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<CompletionsOrderBy>>;
};


export type RoomsCross_PollinationsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Cross_PollinationsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Cross_PollinationsOrderBy>>;
};


export type RoomsMessagesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<MessagesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<MessagesOrderBy>>;
};


export type RoomsModerationsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ModerationsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ModerationsOrderBy>>;
};


export type RoomsOutcomesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<OutcomesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OutcomesOrderBy>>;
};


export type RoomsParticipantsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ParticipantsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ParticipantsOrderBy>>;
};

export type RoomsConnection = {
  __typename?: 'roomsConnection';
  edges: Array<RoomsEdge>;
  pageInfo: PageInfo;
};

export type RoomsDeleteResponse = {
  __typename?: 'roomsDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Rooms>;
};

export type RoomsEdge = {
  __typename?: 'roomsEdge';
  cursor: Scalars['String']['output'];
  node: Rooms;
};

export type RoomsFilter = {
  active?: InputMaybe<BooleanFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  external_room_id?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  starts_at?: InputMaybe<DatetimeFilter>;
  status_type?: InputMaybe<RoomStatusTypeFilter>;
  topic_id?: InputMaybe<UuidFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
};

export type RoomsInsertInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  external_room_id?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  starts_at?: InputMaybe<Scalars['Datetime']['input']>;
  status_type?: InputMaybe<RoomStatusType>;
  topic_id?: InputMaybe<Scalars['UUID']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type RoomsInsertResponse = {
  __typename?: 'roomsInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Rooms>;
};

export type RoomsOrderBy = {
  active?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  external_room_id?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  starts_at?: InputMaybe<OrderByDirection>;
  status_type?: InputMaybe<OrderByDirection>;
  topic_id?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
};

export type RoomsUpdateInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  external_room_id?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  starts_at?: InputMaybe<Scalars['Datetime']['input']>;
  status_type?: InputMaybe<RoomStatusType>;
  topic_id?: InputMaybe<Scalars['UUID']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type RoomsUpdateResponse = {
  __typename?: 'roomsUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Rooms>;
};

export enum TargetType {
  Completion = 'completion',
  CrossPollination = 'cross_pollination',
  Message = 'message',
  Moderation = 'moderation',
  Opinion = 'opinion',
  Outcome = 'outcome',
  Participant = 'participant',
  Room = 'room',
  Topic = 'topic',
  User = 'user'
}

/** Boolean expression comparing fields on type "targetType" */
export type TargetTypeFilter = {
  eq?: InputMaybe<TargetType>;
  in?: InputMaybe<Array<TargetType>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<TargetType>;
};

export enum TimingType {
  AfterRoom = 'after_room',
  BeforeRoom = 'before_room',
  DuringRoom = 'during_room',
  Standalone = 'standalone'
}

/** Boolean expression comparing fields on type "timingType" */
export type TimingTypeFilter = {
  eq?: InputMaybe<TimingType>;
  in?: InputMaybe<Array<TimingType>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<TimingType>;
};

export enum TopicType {
  Original = 'original',
  Remixed = 'remixed'
}

/** Boolean expression comparing fields on type "topicType" */
export type TopicTypeFilter = {
  eq?: InputMaybe<TopicType>;
  in?: InputMaybe<Array<TopicType>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<TopicType>;
};

export type Topics = Node & {
  __typename?: 'topics';
  active: Scalars['Boolean']['output'];
  completionsCollection?: Maybe<CompletionsConnection>;
  content: Scalars['String']['output'];
  created_at: Scalars['Datetime']['output'];
  cross_pollinationsCollection?: Maybe<Cross_PollinationsConnection>;
  id: Scalars['UUID']['output'];
  moderationsCollection?: Maybe<ModerationsConnection>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  original_topic_id?: Maybe<Scalars['UUID']['output']>;
  roomsCollection?: Maybe<RoomsConnection>;
  topics?: Maybe<Topics>;
  topicsCollection?: Maybe<TopicsConnection>;
  type: TopicType;
  updated_at: Scalars['Datetime']['output'];
};


export type TopicsCompletionsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<CompletionsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<CompletionsOrderBy>>;
};


export type TopicsCross_PollinationsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Cross_PollinationsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Cross_PollinationsOrderBy>>;
};


export type TopicsModerationsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ModerationsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ModerationsOrderBy>>;
};


export type TopicsRoomsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<RoomsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<RoomsOrderBy>>;
};


export type TopicsTopicsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<TopicsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<TopicsOrderBy>>;
};

export type TopicsConnection = {
  __typename?: 'topicsConnection';
  edges: Array<TopicsEdge>;
  pageInfo: PageInfo;
};

export type TopicsDeleteResponse = {
  __typename?: 'topicsDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Topics>;
};

export type TopicsEdge = {
  __typename?: 'topicsEdge';
  cursor: Scalars['String']['output'];
  node: Topics;
};

export type TopicsFilter = {
  active?: InputMaybe<BooleanFilter>;
  content?: InputMaybe<StringFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  original_topic_id?: InputMaybe<UuidFilter>;
  type?: InputMaybe<TopicTypeFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
};

export type TopicsInsertInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  content?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  original_topic_id?: InputMaybe<Scalars['UUID']['input']>;
  type?: InputMaybe<TopicType>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type TopicsInsertResponse = {
  __typename?: 'topicsInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Topics>;
};

export type TopicsOrderBy = {
  active?: InputMaybe<OrderByDirection>;
  content?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  original_topic_id?: InputMaybe<OrderByDirection>;
  type?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
};

export type TopicsUpdateInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  content?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  original_topic_id?: InputMaybe<Scalars['UUID']['input']>;
  type?: InputMaybe<TopicType>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type TopicsUpdateResponse = {
  __typename?: 'topicsUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Topics>;
};

export type Users = Node & {
  __typename?: 'users';
  active: Scalars['Boolean']['output'];
  auth_user_id?: Maybe<Scalars['UUID']['output']>;
  completionsCollection?: Maybe<CompletionsConnection>;
  created_at: Scalars['Datetime']['output'];
  cross_pollinationsCollection?: Maybe<Cross_PollinationsConnection>;
  demographics: Scalars['JSON']['output'];
  id: Scalars['UUID']['output'];
  moderationsCollection?: Maybe<ModerationsConnection>;
  nick_name: Scalars['String']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  participantsCollection?: Maybe<ParticipantsConnection>;
  updated_at: Scalars['Datetime']['output'];
};


export type UsersCompletionsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<CompletionsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<CompletionsOrderBy>>;
};


export type UsersCross_PollinationsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Cross_PollinationsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Cross_PollinationsOrderBy>>;
};


export type UsersModerationsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ModerationsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ModerationsOrderBy>>;
};


export type UsersParticipantsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ParticipantsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ParticipantsOrderBy>>;
};

export type UsersConnection = {
  __typename?: 'usersConnection';
  edges: Array<UsersEdge>;
  pageInfo: PageInfo;
};

export type UsersDeleteResponse = {
  __typename?: 'usersDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Users>;
};

export type UsersEdge = {
  __typename?: 'usersEdge';
  cursor: Scalars['String']['output'];
  node: Users;
};

export type UsersFilter = {
  active?: InputMaybe<BooleanFilter>;
  auth_user_id?: InputMaybe<UuidFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  nick_name?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
};

export type UsersInsertInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  auth_user_id?: InputMaybe<Scalars['UUID']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  demographics?: InputMaybe<Scalars['JSON']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  nick_name?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type UsersInsertResponse = {
  __typename?: 'usersInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Users>;
};

export type UsersOrderBy = {
  active?: InputMaybe<OrderByDirection>;
  auth_user_id?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  nick_name?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
};

export type UsersUpdateInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  auth_user_id?: InputMaybe<Scalars['UUID']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  demographics?: InputMaybe<Scalars['JSON']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  nick_name?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type UsersUpdateResponse = {
  __typename?: 'usersUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Users>;
};

export enum VisibilityType {
  Private = 'private',
  Public = 'public'
}

/** Boolean expression comparing fields on type "visibilityType" */
export type VisibilityTypeFilter = {
  eq?: InputMaybe<VisibilityType>;
  in?: InputMaybe<Array<VisibilityType>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<VisibilityType>;
};

export type FullOpinionFragment = { __typename?: 'opinions', id: any, active: boolean, type: OpinionType, outcome_id?: any | null, participant_id: any, range_value: number, statement: string, option_type?: OpinionOptionType | null, created_at: any, updated_at: any };

export type FullOutcomeFragment = { __typename?: 'outcomes', id: any, active: boolean, type: OutcomeType, room_id?: any | null, content: string, created_at: any, updated_at: any, opinionsCollection?: { __typename?: 'opinionsConnection', edges: Array<{ __typename?: 'opinionsEdge', node: { __typename?: 'opinions', id: any, active: boolean, type: OpinionType, outcome_id?: any | null, participant_id: any, range_value: number, statement: string, option_type?: OpinionOptionType | null, created_at: any, updated_at: any } }> } | null };

export type FullParticipantFragment = { __typename?: 'participants', id: any, active: boolean, room_id?: any | null, user_id?: any | null, nick_name: string, participation_score: number, created_at: any, updated_at: any, status: ParticipantStatusType, last_seen_at: any };

export type ChangeOpinionMutationVariables = Exact<{
  outcomeId: Scalars['UUID']['input'];
  participantId: Scalars['UUID']['input'];
  type: OpinionType;
  rangeValue?: InputMaybe<Scalars['Int']['input']>;
  statement?: InputMaybe<Scalars['String']['input']>;
  optionType?: InputMaybe<OpinionOptionType>;
}>;


export type ChangeOpinionMutation = { __typename?: 'Mutation', updateopinionsCollection: { __typename?: 'opinionsUpdateResponse', affectedCount: number, records: Array<{ __typename?: 'opinions', id: any, active: boolean, type: OpinionType, outcome_id?: any | null, participant_id: any, range_value: number, statement: string, option_type?: OpinionOptionType | null, created_at: any, updated_at: any }> } };

export type CreateOpinionMutationVariables = Exact<{
  outcomeId: Scalars['UUID']['input'];
  participantId: Scalars['UUID']['input'];
  type: OpinionType;
  rangeValue?: InputMaybe<Scalars['Int']['input']>;
  statement?: InputMaybe<Scalars['String']['input']>;
  optionType?: InputMaybe<OpinionOptionType>;
}>;


export type CreateOpinionMutation = { __typename?: 'Mutation', insertIntoopinionsCollection?: { __typename?: 'opinionsInsertResponse', affectedCount: number, records: Array<{ __typename?: 'opinions', id: any, active: boolean, type: OpinionType, outcome_id?: any | null, participant_id: any, range_value: number, statement: string, option_type?: OpinionOptionType | null, created_at: any, updated_at: any }> } | null };

export type CreateParticipantMutationVariables = Exact<{
  userId: Scalars['UUID']['input'];
  nickName?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateParticipantMutation = { __typename?: 'Mutation', insertIntoparticipantsCollection?: { __typename?: 'participantsInsertResponse', records: Array<{ __typename?: 'participants', id: any }> } | null };

export type EnterRoomMutationVariables = Exact<{
  participantId: Scalars['UUID']['input'];
}>;


export type EnterRoomMutation = { __typename?: 'Mutation', updateparticipantsCollection: { __typename?: 'participantsUpdateResponse', affectedCount: number, records: Array<{ __typename?: 'participants', id: any, status: ParticipantStatusType, room_id?: any | null }> } };

export type GetLobbyParticipantsQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
}>;


export type GetLobbyParticipantsQuery = { __typename?: 'Query', participantsCollection?: { __typename?: 'participantsConnection', edges: Array<{ __typename?: 'participantsEdge', node: { __typename?: 'participants', id: any, active: boolean, room_id?: any | null, user_id?: any | null, nick_name: string, participation_score: number, created_at: any, updated_at: any, status: ParticipantStatusType, last_seen_at: any } }> } | null };

export type GetParticipantsFromUserQueryVariables = Exact<{
  authUserId: Scalars['UUID']['input'];
}>;


export type GetParticipantsFromUserQuery = { __typename?: 'Query', usersCollection?: { __typename?: 'usersConnection', edges: Array<{ __typename?: 'usersEdge', node: { __typename?: 'users', id: any, active: boolean, nick_name: string, demographics: any, auth_user_id?: any | null, updated_at: any, created_at: any, participantsCollection?: { __typename?: 'participantsConnection', edges: Array<{ __typename?: 'participantsEdge', node: { __typename?: 'participants', id: any, active: boolean, room_id?: any | null, user_id?: any | null, nick_name: string, participation_score: number, created_at: any, updated_at: any, status: ParticipantStatusType, last_seen_at: any } }> } | null } }> } | null };

export type GetRoomIdFromParticipantQueryVariables = Exact<{
  participantID: Scalars['UUID']['input'];
}>;


export type GetRoomIdFromParticipantQuery = { __typename?: 'Query', participantsCollection?: { __typename?: 'participantsConnection', edges: Array<{ __typename?: 'participantsEdge', node: { __typename?: 'participants', room_id?: any | null } }> } | null };

export type RoomMessageFragment = { __typename?: 'messages', id: any, active: boolean, type: MessageType, timing_type: TimingType, visibility_type: VisibilityType, content: string, participant_id?: any | null, room_id?: any | null, room_status_type?: RoomStatusType | null, easy_language?: boolean | null, safe_language?: boolean | null, created_at: any };

export type GetRoomMessagesQueryVariables = Exact<{
  roomId?: InputMaybe<Scalars['UUID']['input']>;
  botMessageHistoryAmount: Scalars['Int']['input'];
  participantMessageHistoryAmount: Scalars['Int']['input'];
}>;


export type GetRoomMessagesQuery = { __typename?: 'Query', messagesCollection?: { __typename?: 'messagesConnection', edges: Array<{ __typename?: 'messagesEdge', node: { __typename?: 'messages', id: any, active: boolean, type: MessageType, timing_type: TimingType, visibility_type: VisibilityType, content: string, participant_id?: any | null, room_id?: any | null, room_status_type?: RoomStatusType | null, easy_language?: boolean | null, safe_language?: boolean | null, created_at: any } }> } | null, botMessagesCollection?: { __typename?: 'messagesConnection', edges: Array<{ __typename?: 'messagesEdge', node: { __typename?: 'messages', id: any, active: boolean, type: MessageType, timing_type: TimingType, visibility_type: VisibilityType, content: string, participant_id?: any | null, room_id?: any | null, room_status_type?: RoomStatusType | null, easy_language?: boolean | null, safe_language?: boolean | null, created_at: any } }> } | null, participantMessagesCollection?: { __typename?: 'messagesConnection', edges: Array<{ __typename?: 'messagesEdge', node: { __typename?: 'messages', id: any, active: boolean, type: MessageType, timing_type: TimingType, visibility_type: VisibilityType, content: string, participant_id?: any | null, room_id?: any | null, room_status_type?: RoomStatusType | null, easy_language?: boolean | null, safe_language?: boolean | null, created_at: any } }> } | null };

export type GetRoomOutcomesQueryVariables = Exact<{
  roomId?: InputMaybe<Scalars['UUID']['input']>;
}>;


export type GetRoomOutcomesQuery = { __typename?: 'Query', outcomesCollection?: { __typename?: 'outcomesConnection', edges: Array<{ __typename?: 'outcomesEdge', node: { __typename?: 'outcomes', id: any, active: boolean, type: OutcomeType, room_id?: any | null, content: string, created_at: any, updated_at: any, opinionsCollection?: { __typename?: 'opinionsConnection', edges: Array<{ __typename?: 'opinionsEdge', node: { __typename?: 'opinions', id: any, active: boolean, type: OpinionType, outcome_id?: any | null, participant_id: any, range_value: number, statement: string, option_type?: OpinionOptionType | null, created_at: any, updated_at: any } }> } | null } }> } | null };

export type RoomParticipantFragment = { __typename?: 'participants', id: any, active: boolean, nick_name: string, user_id?: any | null, room_id?: any | null, status: ParticipantStatusType, updated_at: any, created_at: any };

export type GetRoomParticipantsQueryVariables = Exact<{
  roomId: Scalars['UUID']['input'];
}>;


export type GetRoomParticipantsQuery = { __typename?: 'Query', participantsCollection?: { __typename?: 'participantsConnection', edges: Array<{ __typename?: 'participantsEdge', node: { __typename?: 'participants', id: any, active: boolean, nick_name: string, user_id?: any | null, room_id?: any | null, status: ParticipantStatusType, updated_at: any, created_at: any } }> } | null };

export type SimpleRoomFragment = { __typename?: 'rooms', id: any, active: boolean, external_room_id?: string | null, status_type: RoomStatusType, updated_at: any, created_at: any, topics: { __typename?: 'topics', id: any, active: boolean, content: string, updated_at: any, created_at: any } };

export type SimpleRoomTopicFragment = { __typename?: 'topics', id: any, active: boolean, content: string, updated_at: any, created_at: any };

export type GetRoomsQueryVariables = Exact<{
  roomId?: InputMaybe<Scalars['UUID']['input']>;
}>;


export type GetRoomsQuery = { __typename?: 'Query', roomsCollection?: { __typename?: 'roomsConnection', edges: Array<{ __typename?: 'roomsEdge', node: { __typename?: 'rooms', id: any, active: boolean, external_room_id?: string | null, status_type: RoomStatusType, updated_at: any, created_at: any, topics: { __typename?: 'topics', id: any, active: boolean, content: string, updated_at: any, created_at: any } } }> } | null };

export type FullTopicFragment = { __typename?: 'topics', id: any, active: boolean, type: TopicType, content: string, original_topic_id?: any | null, updated_at: any, created_at: any };

export type GetTopicsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTopicsQuery = { __typename?: 'Query', topicsCollection?: { __typename?: 'topicsConnection', edges: Array<{ __typename?: 'topicsEdge', node: { __typename?: 'topics', id: any, active: boolean, type: TopicType, content: string, original_topic_id?: any | null, updated_at: any, created_at: any } }> } | null };

export type FullUserFragment = { __typename?: 'users', id: any, active: boolean, nick_name: string, demographics: any, auth_user_id?: any | null, updated_at: any, created_at: any };

export type GetUserQueryVariables = Exact<{
  authUserId: Scalars['UUID']['input'];
}>;


export type GetUserQuery = { __typename?: 'Query', usersCollection?: { __typename?: 'usersConnection', edges: Array<{ __typename?: 'usersEdge', node: { __typename?: 'users', id: any, active: boolean, nick_name: string, demographics: any, auth_user_id?: any | null, updated_at: any, created_at: any } }> } | null };

export type LeaveRoomMutationVariables = Exact<{
  participantId: Scalars['UUID']['input'];
}>;


export type LeaveRoomMutation = { __typename?: 'Mutation', updateparticipantsCollection: { __typename?: 'participantsUpdateResponse', affectedCount: number, records: Array<{ __typename?: 'participants', id: any, status: ParticipantStatusType, room_id?: any | null }> } };

export type PingParticipantMutationVariables = Exact<{
  participantId: Scalars['UUID']['input'];
  lastSeenAt: Scalars['Datetime']['input'];
}>;


export type PingParticipantMutation = { __typename?: 'Mutation', updateparticipantsCollection: { __typename?: 'participantsUpdateResponse', affectedCount: number } };

export type SendRoomMessageMutationVariables = Exact<{
  roomId: Scalars['UUID']['input'];
  participantId: Scalars['UUID']['input'];
  content: Scalars['String']['input'];
}>;


export type SendRoomMessageMutation = { __typename?: 'Mutation', insertIntomessagesCollection?: { __typename?: 'messagesInsertResponse', records: Array<{ __typename?: 'messages', id: any, room_id?: any | null, participant_id?: any | null, content: string }> } | null };

export type StartRoomMutationVariables = Exact<{
  topicId: Scalars['UUID']['input'];
}>;


export type StartRoomMutation = { __typename?: 'Mutation', insertIntoroomsCollection?: { __typename?: 'roomsInsertResponse', affectedCount: number, records: Array<{ __typename?: 'rooms', id: any }> } | null };

export type UpdateDemographicsMutationVariables = Exact<{
  userId: Scalars['UUID']['input'];
  demographics?: InputMaybe<Scalars['JSON']['input']>;
}>;


export type UpdateDemographicsMutation = { __typename?: 'Mutation', updateusersCollection: { __typename?: 'usersUpdateResponse', affectedCount: number } };

export const FullOpinionFragmentDoc = gql`
    fragment FullOpinion on opinions {
  id
  active
  type
  outcome_id
  participant_id
  range_value
  statement
  option_type
  created_at
  updated_at
}
    `;
export const FullOutcomeFragmentDoc = gql`
    fragment FullOutcome on outcomes {
  id
  active
  type
  room_id
  content
  created_at
  updated_at
  opinionsCollection(orderBy: {created_at: DescNullsLast}) {
    edges {
      node {
        ...FullOpinion
      }
    }
  }
}
    ${FullOpinionFragmentDoc}`;
export const FullParticipantFragmentDoc = gql`
    fragment FullParticipant on participants {
  id
  active
  room_id
  user_id
  nick_name
  participation_score
  created_at
  updated_at
  status
  last_seen_at
}
    `;
export const RoomMessageFragmentDoc = gql`
    fragment RoomMessage on messages {
  id
  active
  type
  timing_type
  visibility_type
  content
  participant_id
  room_id
  room_status_type
  easy_language
  safe_language
  created_at
  type
}
    `;
export const RoomParticipantFragmentDoc = gql`
    fragment RoomParticipant on participants {
  id
  active
  nick_name
  user_id
  room_id
  status
  updated_at
  created_at
}
    `;
export const SimpleRoomTopicFragmentDoc = gql`
    fragment SimpleRoomTopic on topics {
  id
  active
  content
  updated_at
  created_at
}
    `;
export const SimpleRoomFragmentDoc = gql`
    fragment SimpleRoom on rooms {
  id
  active
  topics {
    ...SimpleRoomTopic
  }
  external_room_id
  status_type
  updated_at
  created_at
}
    ${SimpleRoomTopicFragmentDoc}`;
export const FullTopicFragmentDoc = gql`
    fragment FullTopic on topics {
  id
  active
  type
  content
  original_topic_id
  updated_at
  created_at
}
    `;
export const FullUserFragmentDoc = gql`
    fragment FullUser on users {
  id
  active
  nick_name
  demographics
  auth_user_id
  updated_at
  created_at
}
    `;
export const ChangeOpinionDocument = gql`
    mutation ChangeOpinion($outcomeId: UUID!, $participantId: UUID!, $type: opinionType!, $rangeValue: Int, $statement: String, $optionType: opinionOptionType) {
  updateopinionsCollection(
    filter: {outcome_id: {eq: $outcomeId}, participant_id: {eq: $participantId}}
    set: {type: $type, range_value: $rangeValue, statement: $statement, option_type: $optionType}
  ) {
    affectedCount
    records {
      ...FullOpinion
    }
  }
}
    ${FullOpinionFragmentDoc}`;
export type ChangeOpinionMutationFn = Apollo.MutationFunction<ChangeOpinionMutation, ChangeOpinionMutationVariables>;

/**
 * __useChangeOpinionMutation__
 *
 * To run a mutation, you first call `useChangeOpinionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChangeOpinionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [changeOpinionMutation, { data, loading, error }] = useChangeOpinionMutation({
 *   variables: {
 *      outcomeId: // value for 'outcomeId'
 *      participantId: // value for 'participantId'
 *      type: // value for 'type'
 *      rangeValue: // value for 'rangeValue'
 *      statement: // value for 'statement'
 *      optionType: // value for 'optionType'
 *   },
 * });
 */
export function useChangeOpinionMutation(baseOptions?: Apollo.MutationHookOptions<ChangeOpinionMutation, ChangeOpinionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ChangeOpinionMutation, ChangeOpinionMutationVariables>(ChangeOpinionDocument, options);
      }
export type ChangeOpinionMutationHookResult = ReturnType<typeof useChangeOpinionMutation>;
export type ChangeOpinionMutationResult = Apollo.MutationResult<ChangeOpinionMutation>;
export type ChangeOpinionMutationOptions = Apollo.BaseMutationOptions<ChangeOpinionMutation, ChangeOpinionMutationVariables>;
export const CreateOpinionDocument = gql`
    mutation CreateOpinion($outcomeId: UUID!, $participantId: UUID!, $type: opinionType!, $rangeValue: Int, $statement: String, $optionType: opinionOptionType) {
  insertIntoopinionsCollection(
    objects: {outcome_id: $outcomeId, participant_id: $participantId, type: $type, range_value: $rangeValue, statement: $statement, option_type: $optionType}
  ) {
    affectedCount
    records {
      ...FullOpinion
    }
  }
}
    ${FullOpinionFragmentDoc}`;
export type CreateOpinionMutationFn = Apollo.MutationFunction<CreateOpinionMutation, CreateOpinionMutationVariables>;

/**
 * __useCreateOpinionMutation__
 *
 * To run a mutation, you first call `useCreateOpinionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateOpinionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createOpinionMutation, { data, loading, error }] = useCreateOpinionMutation({
 *   variables: {
 *      outcomeId: // value for 'outcomeId'
 *      participantId: // value for 'participantId'
 *      type: // value for 'type'
 *      rangeValue: // value for 'rangeValue'
 *      statement: // value for 'statement'
 *      optionType: // value for 'optionType'
 *   },
 * });
 */
export function useCreateOpinionMutation(baseOptions?: Apollo.MutationHookOptions<CreateOpinionMutation, CreateOpinionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateOpinionMutation, CreateOpinionMutationVariables>(CreateOpinionDocument, options);
      }
export type CreateOpinionMutationHookResult = ReturnType<typeof useCreateOpinionMutation>;
export type CreateOpinionMutationResult = Apollo.MutationResult<CreateOpinionMutation>;
export type CreateOpinionMutationOptions = Apollo.BaseMutationOptions<CreateOpinionMutation, CreateOpinionMutationVariables>;
export const CreateParticipantDocument = gql`
    mutation CreateParticipant($userId: UUID!, $nickName: String) {
  insertIntoparticipantsCollection(
    objects: {user_id: $userId, nick_name: $nickName, status: queued}
  ) {
    records {
      id
    }
  }
}
    `;
export type CreateParticipantMutationFn = Apollo.MutationFunction<CreateParticipantMutation, CreateParticipantMutationVariables>;

/**
 * __useCreateParticipantMutation__
 *
 * To run a mutation, you first call `useCreateParticipantMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateParticipantMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createParticipantMutation, { data, loading, error }] = useCreateParticipantMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      nickName: // value for 'nickName'
 *   },
 * });
 */
export function useCreateParticipantMutation(baseOptions?: Apollo.MutationHookOptions<CreateParticipantMutation, CreateParticipantMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateParticipantMutation, CreateParticipantMutationVariables>(CreateParticipantDocument, options);
      }
export type CreateParticipantMutationHookResult = ReturnType<typeof useCreateParticipantMutation>;
export type CreateParticipantMutationResult = Apollo.MutationResult<CreateParticipantMutation>;
export type CreateParticipantMutationOptions = Apollo.BaseMutationOptions<CreateParticipantMutation, CreateParticipantMutationVariables>;
export const EnterRoomDocument = gql`
    mutation EnterRoom($participantId: UUID!) {
  updateparticipantsCollection(
    filter: {id: {eq: $participantId}, status: {eq: waiting_for_confirmation}}
    set: {status: in_room}
  ) {
    affectedCount
    records {
      id
      status
      room_id
    }
  }
}
    `;
export type EnterRoomMutationFn = Apollo.MutationFunction<EnterRoomMutation, EnterRoomMutationVariables>;

/**
 * __useEnterRoomMutation__
 *
 * To run a mutation, you first call `useEnterRoomMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEnterRoomMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [enterRoomMutation, { data, loading, error }] = useEnterRoomMutation({
 *   variables: {
 *      participantId: // value for 'participantId'
 *   },
 * });
 */
export function useEnterRoomMutation(baseOptions?: Apollo.MutationHookOptions<EnterRoomMutation, EnterRoomMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<EnterRoomMutation, EnterRoomMutationVariables>(EnterRoomDocument, options);
      }
export type EnterRoomMutationHookResult = ReturnType<typeof useEnterRoomMutation>;
export type EnterRoomMutationResult = Apollo.MutationResult<EnterRoomMutation>;
export type EnterRoomMutationOptions = Apollo.BaseMutationOptions<EnterRoomMutation, EnterRoomMutationVariables>;
export const GetLobbyParticipantsDocument = gql`
    query GetLobbyParticipants($userId: UUID!) {
  participantsCollection(
    filter: {user_id: {eq: $userId}, status: {in: [waiting_for_confirmation, queued]}, active: {eq: true}}
    orderBy: {created_at: DescNullsLast}
  ) {
    edges {
      node {
        ...FullParticipant
      }
    }
  }
}
    ${FullParticipantFragmentDoc}`;

/**
 * __useGetLobbyParticipantsQuery__
 *
 * To run a query within a React component, call `useGetLobbyParticipantsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLobbyParticipantsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLobbyParticipantsQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetLobbyParticipantsQuery(baseOptions: Apollo.QueryHookOptions<GetLobbyParticipantsQuery, GetLobbyParticipantsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLobbyParticipantsQuery, GetLobbyParticipantsQueryVariables>(GetLobbyParticipantsDocument, options);
      }
export function useGetLobbyParticipantsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLobbyParticipantsQuery, GetLobbyParticipantsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLobbyParticipantsQuery, GetLobbyParticipantsQueryVariables>(GetLobbyParticipantsDocument, options);
        }
export type GetLobbyParticipantsQueryHookResult = ReturnType<typeof useGetLobbyParticipantsQuery>;
export type GetLobbyParticipantsLazyQueryHookResult = ReturnType<typeof useGetLobbyParticipantsLazyQuery>;
export type GetLobbyParticipantsQueryResult = Apollo.QueryResult<GetLobbyParticipantsQuery, GetLobbyParticipantsQueryVariables>;
export const GetParticipantsFromUserDocument = gql`
    query GetParticipantsFromUser($authUserId: UUID!) {
  usersCollection(filter: {auth_user_id: {eq: $authUserId}}) {
    edges {
      node {
        ...FullUser
        participantsCollection {
          edges {
            node {
              ...FullParticipant
            }
          }
        }
      }
    }
  }
}
    ${FullUserFragmentDoc}
${FullParticipantFragmentDoc}`;

/**
 * __useGetParticipantsFromUserQuery__
 *
 * To run a query within a React component, call `useGetParticipantsFromUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetParticipantsFromUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetParticipantsFromUserQuery({
 *   variables: {
 *      authUserId: // value for 'authUserId'
 *   },
 * });
 */
export function useGetParticipantsFromUserQuery(baseOptions: Apollo.QueryHookOptions<GetParticipantsFromUserQuery, GetParticipantsFromUserQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetParticipantsFromUserQuery, GetParticipantsFromUserQueryVariables>(GetParticipantsFromUserDocument, options);
      }
export function useGetParticipantsFromUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetParticipantsFromUserQuery, GetParticipantsFromUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetParticipantsFromUserQuery, GetParticipantsFromUserQueryVariables>(GetParticipantsFromUserDocument, options);
        }
export type GetParticipantsFromUserQueryHookResult = ReturnType<typeof useGetParticipantsFromUserQuery>;
export type GetParticipantsFromUserLazyQueryHookResult = ReturnType<typeof useGetParticipantsFromUserLazyQuery>;
export type GetParticipantsFromUserQueryResult = Apollo.QueryResult<GetParticipantsFromUserQuery, GetParticipantsFromUserQueryVariables>;
export const GetRoomIdFromParticipantDocument = gql`
    query GetRoomIdFromParticipant($participantID: UUID!) {
  participantsCollection(filter: {id: {eq: $participantID}}, first: 1) {
    edges {
      node {
        room_id
      }
    }
  }
}
    `;

/**
 * __useGetRoomIdFromParticipantQuery__
 *
 * To run a query within a React component, call `useGetRoomIdFromParticipantQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRoomIdFromParticipantQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRoomIdFromParticipantQuery({
 *   variables: {
 *      participantID: // value for 'participantID'
 *   },
 * });
 */
export function useGetRoomIdFromParticipantQuery(baseOptions: Apollo.QueryHookOptions<GetRoomIdFromParticipantQuery, GetRoomIdFromParticipantQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRoomIdFromParticipantQuery, GetRoomIdFromParticipantQueryVariables>(GetRoomIdFromParticipantDocument, options);
      }
export function useGetRoomIdFromParticipantLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRoomIdFromParticipantQuery, GetRoomIdFromParticipantQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRoomIdFromParticipantQuery, GetRoomIdFromParticipantQueryVariables>(GetRoomIdFromParticipantDocument, options);
        }
export type GetRoomIdFromParticipantQueryHookResult = ReturnType<typeof useGetRoomIdFromParticipantQuery>;
export type GetRoomIdFromParticipantLazyQueryHookResult = ReturnType<typeof useGetRoomIdFromParticipantLazyQuery>;
export type GetRoomIdFromParticipantQueryResult = Apollo.QueryResult<GetRoomIdFromParticipantQuery, GetRoomIdFromParticipantQueryVariables>;
export const GetRoomMessagesDocument = gql`
    query GetRoomMessages($roomId: UUID, $botMessageHistoryAmount: Int!, $participantMessageHistoryAmount: Int!) {
  messagesCollection(
    filter: {active: {eq: true}, room_id: {eq: $roomId}}
    orderBy: {created_at: AscNullsLast}
    last: 30
  ) {
    edges {
      node {
        ...RoomMessage
      }
    }
  }
  botMessagesCollection: messagesCollection(
    filter: {type: {eq: bot}, active: {eq: true}, room_id: {eq: $roomId}}
    orderBy: {created_at: AscNullsLast}
    last: $botMessageHistoryAmount
  ) {
    edges {
      node {
        ...RoomMessage
      }
    }
  }
  participantMessagesCollection: messagesCollection(
    filter: {type: {in: [chat, voice]}, active: {eq: true}, room_id: {eq: $roomId}}
    orderBy: {created_at: AscNullsLast}
    last: $participantMessageHistoryAmount
  ) {
    edges {
      node {
        ...RoomMessage
      }
    }
  }
}
    ${RoomMessageFragmentDoc}`;

/**
 * __useGetRoomMessagesQuery__
 *
 * To run a query within a React component, call `useGetRoomMessagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRoomMessagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRoomMessagesQuery({
 *   variables: {
 *      roomId: // value for 'roomId'
 *      botMessageHistoryAmount: // value for 'botMessageHistoryAmount'
 *      participantMessageHistoryAmount: // value for 'participantMessageHistoryAmount'
 *   },
 * });
 */
export function useGetRoomMessagesQuery(baseOptions: Apollo.QueryHookOptions<GetRoomMessagesQuery, GetRoomMessagesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRoomMessagesQuery, GetRoomMessagesQueryVariables>(GetRoomMessagesDocument, options);
      }
export function useGetRoomMessagesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRoomMessagesQuery, GetRoomMessagesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRoomMessagesQuery, GetRoomMessagesQueryVariables>(GetRoomMessagesDocument, options);
        }
export type GetRoomMessagesQueryHookResult = ReturnType<typeof useGetRoomMessagesQuery>;
export type GetRoomMessagesLazyQueryHookResult = ReturnType<typeof useGetRoomMessagesLazyQuery>;
export type GetRoomMessagesQueryResult = Apollo.QueryResult<GetRoomMessagesQuery, GetRoomMessagesQueryVariables>;
export const GetRoomOutcomesDocument = gql`
    query GetRoomOutcomes($roomId: UUID) {
  outcomesCollection(
    filter: {active: {eq: true}, room_id: {eq: $roomId}}
    orderBy: {created_at: DescNullsLast}
  ) {
    edges {
      node {
        ...FullOutcome
      }
    }
  }
}
    ${FullOutcomeFragmentDoc}`;

/**
 * __useGetRoomOutcomesQuery__
 *
 * To run a query within a React component, call `useGetRoomOutcomesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRoomOutcomesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRoomOutcomesQuery({
 *   variables: {
 *      roomId: // value for 'roomId'
 *   },
 * });
 */
export function useGetRoomOutcomesQuery(baseOptions?: Apollo.QueryHookOptions<GetRoomOutcomesQuery, GetRoomOutcomesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRoomOutcomesQuery, GetRoomOutcomesQueryVariables>(GetRoomOutcomesDocument, options);
      }
export function useGetRoomOutcomesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRoomOutcomesQuery, GetRoomOutcomesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRoomOutcomesQuery, GetRoomOutcomesQueryVariables>(GetRoomOutcomesDocument, options);
        }
export type GetRoomOutcomesQueryHookResult = ReturnType<typeof useGetRoomOutcomesQuery>;
export type GetRoomOutcomesLazyQueryHookResult = ReturnType<typeof useGetRoomOutcomesLazyQuery>;
export type GetRoomOutcomesQueryResult = Apollo.QueryResult<GetRoomOutcomesQuery, GetRoomOutcomesQueryVariables>;
export const GetRoomParticipantsDocument = gql`
    query GetRoomParticipants($roomId: UUID!) {
  participantsCollection(
    filter: {active: {eq: true}, status: {in: [in_room]}, room_id: {eq: $roomId}}
  ) {
    edges {
      node {
        ...RoomParticipant
      }
    }
  }
}
    ${RoomParticipantFragmentDoc}`;

/**
 * __useGetRoomParticipantsQuery__
 *
 * To run a query within a React component, call `useGetRoomParticipantsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRoomParticipantsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRoomParticipantsQuery({
 *   variables: {
 *      roomId: // value for 'roomId'
 *   },
 * });
 */
export function useGetRoomParticipantsQuery(baseOptions: Apollo.QueryHookOptions<GetRoomParticipantsQuery, GetRoomParticipantsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRoomParticipantsQuery, GetRoomParticipantsQueryVariables>(GetRoomParticipantsDocument, options);
      }
export function useGetRoomParticipantsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRoomParticipantsQuery, GetRoomParticipantsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRoomParticipantsQuery, GetRoomParticipantsQueryVariables>(GetRoomParticipantsDocument, options);
        }
export type GetRoomParticipantsQueryHookResult = ReturnType<typeof useGetRoomParticipantsQuery>;
export type GetRoomParticipantsLazyQueryHookResult = ReturnType<typeof useGetRoomParticipantsLazyQuery>;
export type GetRoomParticipantsQueryResult = Apollo.QueryResult<GetRoomParticipantsQuery, GetRoomParticipantsQueryVariables>;
export const GetRoomsDocument = gql`
    query GetRooms($roomId: UUID) {
  roomsCollection(
    filter: {active: {eq: true}, id: {eq: $roomId}}
    orderBy: {created_at: DescNullsLast}
  ) {
    edges {
      node {
        ...SimpleRoom
      }
    }
  }
}
    ${SimpleRoomFragmentDoc}`;

/**
 * __useGetRoomsQuery__
 *
 * To run a query within a React component, call `useGetRoomsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRoomsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRoomsQuery({
 *   variables: {
 *      roomId: // value for 'roomId'
 *   },
 * });
 */
export function useGetRoomsQuery(baseOptions?: Apollo.QueryHookOptions<GetRoomsQuery, GetRoomsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRoomsQuery, GetRoomsQueryVariables>(GetRoomsDocument, options);
      }
export function useGetRoomsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRoomsQuery, GetRoomsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRoomsQuery, GetRoomsQueryVariables>(GetRoomsDocument, options);
        }
export type GetRoomsQueryHookResult = ReturnType<typeof useGetRoomsQuery>;
export type GetRoomsLazyQueryHookResult = ReturnType<typeof useGetRoomsLazyQuery>;
export type GetRoomsQueryResult = Apollo.QueryResult<GetRoomsQuery, GetRoomsQueryVariables>;
export const GetTopicsDocument = gql`
    query GetTopics {
  topicsCollection(filter: {active: {eq: true}}) {
    edges {
      node {
        ...FullTopic
      }
    }
  }
}
    ${FullTopicFragmentDoc}`;

/**
 * __useGetTopicsQuery__
 *
 * To run a query within a React component, call `useGetTopicsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTopicsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTopicsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetTopicsQuery(baseOptions?: Apollo.QueryHookOptions<GetTopicsQuery, GetTopicsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTopicsQuery, GetTopicsQueryVariables>(GetTopicsDocument, options);
      }
export function useGetTopicsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTopicsQuery, GetTopicsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTopicsQuery, GetTopicsQueryVariables>(GetTopicsDocument, options);
        }
export type GetTopicsQueryHookResult = ReturnType<typeof useGetTopicsQuery>;
export type GetTopicsLazyQueryHookResult = ReturnType<typeof useGetTopicsLazyQuery>;
export type GetTopicsQueryResult = Apollo.QueryResult<GetTopicsQuery, GetTopicsQueryVariables>;
export const GetUserDocument = gql`
    query GetUser($authUserId: UUID!) {
  usersCollection(
    filter: {active: {eq: true}, auth_user_id: {eq: $authUserId}}
    first: 1
  ) {
    edges {
      node {
        ...FullUser
      }
    }
  }
}
    ${FullUserFragmentDoc}`;

/**
 * __useGetUserQuery__
 *
 * To run a query within a React component, call `useGetUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserQuery({
 *   variables: {
 *      authUserId: // value for 'authUserId'
 *   },
 * });
 */
export function useGetUserQuery(baseOptions: Apollo.QueryHookOptions<GetUserQuery, GetUserQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserQuery, GetUserQueryVariables>(GetUserDocument, options);
      }
export function useGetUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserQuery, GetUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserQuery, GetUserQueryVariables>(GetUserDocument, options);
        }
export type GetUserQueryHookResult = ReturnType<typeof useGetUserQuery>;
export type GetUserLazyQueryHookResult = ReturnType<typeof useGetUserLazyQuery>;
export type GetUserQueryResult = Apollo.QueryResult<GetUserQuery, GetUserQueryVariables>;
export const LeaveRoomDocument = gql`
    mutation LeaveRoom($participantId: UUID!) {
  updateparticipantsCollection(
    filter: {id: {eq: $participantId}}
    set: {status: end_of_session}
  ) {
    affectedCount
    records {
      id
      status
      room_id
    }
  }
}
    `;
export type LeaveRoomMutationFn = Apollo.MutationFunction<LeaveRoomMutation, LeaveRoomMutationVariables>;

/**
 * __useLeaveRoomMutation__
 *
 * To run a mutation, you first call `useLeaveRoomMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLeaveRoomMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [leaveRoomMutation, { data, loading, error }] = useLeaveRoomMutation({
 *   variables: {
 *      participantId: // value for 'participantId'
 *   },
 * });
 */
export function useLeaveRoomMutation(baseOptions?: Apollo.MutationHookOptions<LeaveRoomMutation, LeaveRoomMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LeaveRoomMutation, LeaveRoomMutationVariables>(LeaveRoomDocument, options);
      }
export type LeaveRoomMutationHookResult = ReturnType<typeof useLeaveRoomMutation>;
export type LeaveRoomMutationResult = Apollo.MutationResult<LeaveRoomMutation>;
export type LeaveRoomMutationOptions = Apollo.BaseMutationOptions<LeaveRoomMutation, LeaveRoomMutationVariables>;
export const PingParticipantDocument = gql`
    mutation PingParticipant($participantId: UUID!, $lastSeenAt: Datetime!) {
  updateparticipantsCollection(
    filter: {id: {eq: $participantId}, active: {eq: true}}
    set: {last_seen_at: $lastSeenAt}
  ) {
    affectedCount
  }
}
    `;
export type PingParticipantMutationFn = Apollo.MutationFunction<PingParticipantMutation, PingParticipantMutationVariables>;

/**
 * __usePingParticipantMutation__
 *
 * To run a mutation, you first call `usePingParticipantMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePingParticipantMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [pingParticipantMutation, { data, loading, error }] = usePingParticipantMutation({
 *   variables: {
 *      participantId: // value for 'participantId'
 *      lastSeenAt: // value for 'lastSeenAt'
 *   },
 * });
 */
export function usePingParticipantMutation(baseOptions?: Apollo.MutationHookOptions<PingParticipantMutation, PingParticipantMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PingParticipantMutation, PingParticipantMutationVariables>(PingParticipantDocument, options);
      }
export type PingParticipantMutationHookResult = ReturnType<typeof usePingParticipantMutation>;
export type PingParticipantMutationResult = Apollo.MutationResult<PingParticipantMutation>;
export type PingParticipantMutationOptions = Apollo.BaseMutationOptions<PingParticipantMutation, PingParticipantMutationVariables>;
export const SendRoomMessageDocument = gql`
    mutation SendRoomMessage($roomId: UUID!, $participantId: UUID!, $content: String!) {
  insertIntomessagesCollection(
    objects: {room_id: $roomId, participant_id: $participantId, content: $content}
  ) {
    records {
      id
      room_id
      participant_id
      content
    }
  }
}
    `;
export type SendRoomMessageMutationFn = Apollo.MutationFunction<SendRoomMessageMutation, SendRoomMessageMutationVariables>;

/**
 * __useSendRoomMessageMutation__
 *
 * To run a mutation, you first call `useSendRoomMessageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendRoomMessageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendRoomMessageMutation, { data, loading, error }] = useSendRoomMessageMutation({
 *   variables: {
 *      roomId: // value for 'roomId'
 *      participantId: // value for 'participantId'
 *      content: // value for 'content'
 *   },
 * });
 */
export function useSendRoomMessageMutation(baseOptions?: Apollo.MutationHookOptions<SendRoomMessageMutation, SendRoomMessageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SendRoomMessageMutation, SendRoomMessageMutationVariables>(SendRoomMessageDocument, options);
      }
export type SendRoomMessageMutationHookResult = ReturnType<typeof useSendRoomMessageMutation>;
export type SendRoomMessageMutationResult = Apollo.MutationResult<SendRoomMessageMutation>;
export type SendRoomMessageMutationOptions = Apollo.BaseMutationOptions<SendRoomMessageMutation, SendRoomMessageMutationVariables>;
export const StartRoomDocument = gql`
    mutation StartRoom($topicId: UUID!) {
  insertIntoroomsCollection(objects: {topic_id: $topicId}) {
    affectedCount
    records {
      id
    }
  }
}
    `;
export type StartRoomMutationFn = Apollo.MutationFunction<StartRoomMutation, StartRoomMutationVariables>;

/**
 * __useStartRoomMutation__
 *
 * To run a mutation, you first call `useStartRoomMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useStartRoomMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [startRoomMutation, { data, loading, error }] = useStartRoomMutation({
 *   variables: {
 *      topicId: // value for 'topicId'
 *   },
 * });
 */
export function useStartRoomMutation(baseOptions?: Apollo.MutationHookOptions<StartRoomMutation, StartRoomMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<StartRoomMutation, StartRoomMutationVariables>(StartRoomDocument, options);
      }
export type StartRoomMutationHookResult = ReturnType<typeof useStartRoomMutation>;
export type StartRoomMutationResult = Apollo.MutationResult<StartRoomMutation>;
export type StartRoomMutationOptions = Apollo.BaseMutationOptions<StartRoomMutation, StartRoomMutationVariables>;
export const UpdateDemographicsDocument = gql`
    mutation UpdateDemographics($userId: UUID!, $demographics: JSON) {
  updateusersCollection(
    filter: {id: {eq: $userId}}
    set: {demographics: $demographics}
  ) {
    affectedCount
  }
}
    `;
export type UpdateDemographicsMutationFn = Apollo.MutationFunction<UpdateDemographicsMutation, UpdateDemographicsMutationVariables>;

/**
 * __useUpdateDemographicsMutation__
 *
 * To run a mutation, you first call `useUpdateDemographicsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateDemographicsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateDemographicsMutation, { data, loading, error }] = useUpdateDemographicsMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      demographics: // value for 'demographics'
 *   },
 * });
 */
export function useUpdateDemographicsMutation(baseOptions?: Apollo.MutationHookOptions<UpdateDemographicsMutation, UpdateDemographicsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateDemographicsMutation, UpdateDemographicsMutationVariables>(UpdateDemographicsDocument, options);
      }
export type UpdateDemographicsMutationHookResult = ReturnType<typeof useUpdateDemographicsMutation>;
export type UpdateDemographicsMutationResult = Apollo.MutationResult<UpdateDemographicsMutation>;
export type UpdateDemographicsMutationOptions = Apollo.BaseMutationOptions<UpdateDemographicsMutation, UpdateDemographicsMutationVariables>;