export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
    public: {
        Tables: {
            completions: {
                Row: {
                    active: boolean
                    completion_id: string | null
                    created_at: string
                    id: string
                    message_id: string | null
                    model: Json
                    moderation_id: string | null
                    opinion_id: string | null
                    outcome_id: string | null
                    participant_id: string | null
                    prompt: string
                    room_id: string | null
                    target_type: Database["public"]["Enums"]["targetType"] | null
                    topic_id: string | null
                    type: Database["public"]["Enums"]["completionType"]
                    updated_at: string
                    user_id: string | null
                    variables: Json
                }
                Insert: {
                    active?: boolean
                    completion_id?: string | null
                    created_at?: string
                    id?: string
                    message_id?: string | null
                    model?: Json
                    moderation_id?: string | null
                    opinion_id?: string | null
                    outcome_id?: string | null
                    participant_id?: string | null
                    prompt: string
                    room_id?: string | null
                    target_type?: Database["public"]["Enums"]["targetType"] | null
                    topic_id?: string | null
                    type: Database["public"]["Enums"]["completionType"]
                    updated_at?: string
                    user_id?: string | null
                    variables?: Json
                }
                Update: {
                    active?: boolean
                    completion_id?: string | null
                    created_at?: string
                    id?: string
                    message_id?: string | null
                    model?: Json
                    moderation_id?: string | null
                    opinion_id?: string | null
                    outcome_id?: string | null
                    participant_id?: string | null
                    prompt?: string
                    room_id?: string | null
                    target_type?: Database["public"]["Enums"]["targetType"] | null
                    topic_id?: string | null
                    type?: Database["public"]["Enums"]["completionType"]
                    updated_at?: string
                    user_id?: string | null
                    variables?: Json
                }
                Relationships: [
                    {
                        foreignKeyName: "completions_completion_id_completions_id_fk"
                        columns: ["completion_id"]
                        referencedRelation: "completions"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "completions_message_id_messages_id_fk"
                        columns: ["message_id"]
                        referencedRelation: "messages"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "completions_moderation_id_moderations_id_fk"
                        columns: ["moderation_id"]
                        referencedRelation: "moderations"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "completions_opinion_id_opinions_id_fk"
                        columns: ["opinion_id"]
                        referencedRelation: "opinions"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "completions_outcome_id_outcomes_id_fk"
                        columns: ["outcome_id"]
                        referencedRelation: "outcomes"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "completions_participant_id_participants_id_fk"
                        columns: ["participant_id"]
                        referencedRelation: "participants"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "completions_room_id_rooms_id_fk"
                        columns: ["room_id"]
                        referencedRelation: "rooms"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "completions_topic_id_topics_id_fk"
                        columns: ["topic_id"]
                        referencedRelation: "topics"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "completions_user_id_users_id_fk"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            events: {
                Row: {
                    active: boolean
                    created_at: string
                    ends_at: string | null
                    id: string
                    name: string | null
                    starts_at: string | null
                    updated_at: string
                }
                Insert: {
                    active?: boolean
                    created_at?: string
                    ends_at?: string | null
                    id?: string
                    name?: string | null
                    starts_at?: string | null
                    updated_at?: string
                }
                Update: {
                    active?: boolean
                    created_at?: string
                    ends_at?: string | null
                    id?: string
                    name?: string | null
                    starts_at?: string | null
                    updated_at?: string
                }
                Relationships: []
            }
            messages: {
                Row: {
                    active: boolean
                    content: string
                    created_at: string
                    easy_language: boolean | null
                    embeddings: Json
                    id: string
                    original_message_id: string | null
                    participant_id: string | null
                    room_id: string | null
                    room_status_type: Database["public"]["Enums"]["roomStatusType"] | null
                    safe_language: boolean | null
                    tags: string
                    timing_type: Database["public"]["Enums"]["timingType"]
                    type: Database["public"]["Enums"]["messageType"]
                    updated_at: string
                    visibility_type: Database["public"]["Enums"]["visibilityType"]
                }
                Insert: {
                    active?: boolean
                    content?: string
                    created_at?: string
                    easy_language?: boolean | null
                    embeddings?: Json
                    id?: string
                    original_message_id?: string | null
                    participant_id?: string | null
                    room_id?: string | null
                    room_status_type?:
                    | Database["public"]["Enums"]["roomStatusType"]
                    | null
                    safe_language?: boolean | null
                    tags?: string
                    timing_type?: Database["public"]["Enums"]["timingType"]
                    type?: Database["public"]["Enums"]["messageType"]
                    updated_at?: string
                    visibility_type?: Database["public"]["Enums"]["visibilityType"]
                }
                Update: {
                    active?: boolean
                    content?: string
                    created_at?: string
                    easy_language?: boolean | null
                    embeddings?: Json
                    id?: string
                    original_message_id?: string | null
                    participant_id?: string | null
                    room_id?: string | null
                    room_status_type?:
                    | Database["public"]["Enums"]["roomStatusType"]
                    | null
                    safe_language?: boolean | null
                    tags?: string
                    timing_type?: Database["public"]["Enums"]["timingType"]
                    type?: Database["public"]["Enums"]["messageType"]
                    updated_at?: string
                    visibility_type?: Database["public"]["Enums"]["visibilityType"]
                }
                Relationships: [
                    {
                        foreignKeyName: "messages_original_message_id_messages_id_fk"
                        columns: ["original_message_id"]
                        referencedRelation: "messages"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "messages_participant_id_participants_id_fk"
                        columns: ["participant_id"]
                        referencedRelation: "participants"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "messages_room_id_rooms_id_fk"
                        columns: ["room_id"]
                        referencedRelation: "rooms"
                        referencedColumns: ["id"]
                    }
                ]
            }
            moderations: {
                Row: {
                    active: boolean
                    completed_at: string | null
                    completion_id: string | null
                    created_at: string
                    id: string
                    job_key: string | null
                    message_id: string | null
                    moderation_id: string | null
                    opinion_id: string | null
                    outcome_id: string | null
                    participant_id: string | null
                    result: Json
                    room_id: string | null
                    statement: string | null
                    target_type: Database["public"]["Enums"]["targetType"] | null
                    topic_id: string | null
                    type: string
                    updated_at: string
                    user_id: string | null
                }
                Insert: {
                    active?: boolean
                    completed_at?: string | null
                    completion_id?: string | null
                    created_at?: string
                    id?: string
                    job_key?: string | null
                    message_id?: string | null
                    moderation_id?: string | null
                    opinion_id?: string | null
                    outcome_id?: string | null
                    participant_id?: string | null
                    result?: Json
                    room_id?: string | null
                    statement?: string | null
                    target_type?: Database["public"]["Enums"]["targetType"] | null
                    topic_id?: string | null
                    type: string
                    updated_at?: string
                    user_id?: string | null
                }
                Update: {
                    active?: boolean
                    completed_at?: string | null
                    completion_id?: string | null
                    created_at?: string
                    id?: string
                    job_key?: string | null
                    message_id?: string | null
                    moderation_id?: string | null
                    opinion_id?: string | null
                    outcome_id?: string | null
                    participant_id?: string | null
                    result?: Json
                    room_id?: string | null
                    statement?: string | null
                    target_type?: Database["public"]["Enums"]["targetType"] | null
                    topic_id?: string | null
                    type?: string
                    updated_at?: string
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "moderations_completion_id_completions_id_fk"
                        columns: ["completion_id"]
                        referencedRelation: "completions"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "moderations_message_id_messages_id_fk"
                        columns: ["message_id"]
                        referencedRelation: "messages"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "moderations_moderation_id_moderations_id_fk"
                        columns: ["moderation_id"]
                        referencedRelation: "moderations"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "moderations_opinion_id_opinions_id_fk"
                        columns: ["opinion_id"]
                        referencedRelation: "opinions"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "moderations_outcome_id_outcomes_id_fk"
                        columns: ["outcome_id"]
                        referencedRelation: "outcomes"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "moderations_participant_id_participants_id_fk"
                        columns: ["participant_id"]
                        referencedRelation: "participants"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "moderations_room_id_rooms_id_fk"
                        columns: ["room_id"]
                        referencedRelation: "rooms"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "moderations_topic_id_topics_id_fk"
                        columns: ["topic_id"]
                        referencedRelation: "topics"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "moderations_user_id_users_id_fk"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            opinions: {
                Row: {
                    active: boolean
                    created_at: string
                    id: string
                    option_type: Database["public"]["Enums"]["opinionOptionType"] | null
                    outcome_id: string | null
                    participant_id: string
                    range_value: number
                    statement: string
                    type: Database["public"]["Enums"]["opinionType"]
                    updated_at: string
                }
                Insert: {
                    active?: boolean
                    created_at?: string
                    id?: string
                    option_type?: Database["public"]["Enums"]["opinionOptionType"] | null
                    outcome_id?: string | null
                    participant_id: string
                    range_value?: number
                    statement?: string
                    type?: Database["public"]["Enums"]["opinionType"]
                    updated_at?: string
                }
                Update: {
                    active?: boolean
                    created_at?: string
                    id?: string
                    option_type?: Database["public"]["Enums"]["opinionOptionType"] | null
                    outcome_id?: string | null
                    participant_id?: string
                    range_value?: number
                    statement?: string
                    type?: Database["public"]["Enums"]["opinionType"]
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "opinions_outcome_id_outcomes_id_fk"
                        columns: ["outcome_id"]
                        referencedRelation: "outcomes"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "opinions_participant_id_participants_id_fk"
                        columns: ["participant_id"]
                        referencedRelation: "participants"
                        referencedColumns: ["id"]
                    }
                ]
            }
            outcome_sources: {
                Row: {
                    active: boolean
                    created_at: string
                    id: string
                    message_id: string
                    outcome_id: string
                    updated_at: string
                }
                Insert: {
                    active?: boolean
                    created_at?: string
                    id?: string
                    message_id: string
                    outcome_id: string
                    updated_at?: string
                }
                Update: {
                    active?: boolean
                    created_at?: string
                    id?: string
                    message_id?: string
                    outcome_id?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "outcome_sources_message_id_messages_id_fk"
                        columns: ["message_id"]
                        referencedRelation: "messages"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "outcome_sources_outcome_id_outcomes_id_fk"
                        columns: ["outcome_id"]
                        referencedRelation: "outcomes"
                        referencedColumns: ["id"]
                    }
                ]
            }
            outcomes: {
                Row: {
                    active: boolean
                    content: string
                    created_at: string
                    id: string
                    original_outcome_id: string | null
                    room_id: string | null
                    topic_id: string | null
                    type: Database["public"]["Enums"]["outcomeType"]
                    updated_at: string
                }
                Insert: {
                    active?: boolean
                    content?: string
                    created_at?: string
                    id?: string
                    original_outcome_id?: string | null
                    room_id?: string | null
                    topic_id?: string | null
                    type?: Database["public"]["Enums"]["outcomeType"]
                    updated_at?: string
                }
                Update: {
                    active?: boolean
                    content?: string
                    created_at?: string
                    id?: string
                    original_outcome_id?: string | null
                    room_id?: string | null
                    topic_id?: string | null
                    type?: Database["public"]["Enums"]["outcomeType"]
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "outcomes_original_outcome_id_outcomes_id_fk"
                        columns: ["original_outcome_id"]
                        referencedRelation: "outcomes"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "outcomes_room_id_rooms_id_fk"
                        columns: ["room_id"]
                        referencedRelation: "rooms"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "outcomes_topic_id_topics_id_fk"
                        columns: ["topic_id"]
                        referencedRelation: "topics"
                        referencedColumns: ["id"]
                    }
                ]
            }
            participants: {
                Row: {
                    active: boolean
                    created_at: string
                    demographics: Json
                    id: string
                    last_seen_at: string
                    nick_name: string
                    participation_score: number
                    room_id: string | null
                    status: Database["public"]["Enums"]["participantStatusType"]
                    updated_at: string
                    user_id: string | null
                }
                Insert: {
                    active?: boolean
                    created_at?: string
                    demographics?: Json
                    id?: string
                    last_seen_at?: string
                    nick_name?: string
                    participation_score?: number
                    room_id?: string | null
                    status?: Database["public"]["Enums"]["participantStatusType"]
                    updated_at?: string
                    user_id?: string | null
                }
                Update: {
                    active?: boolean
                    created_at?: string
                    demographics?: Json
                    id?: string
                    last_seen_at?: string
                    nick_name?: string
                    participation_score?: number
                    room_id?: string | null
                    status?: Database["public"]["Enums"]["participantStatusType"]
                    updated_at?: string
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "participants_room_id_rooms_id_fk"
                        columns: ["room_id"]
                        referencedRelation: "rooms"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "participants_user_id_users_id_fk"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            rooms: {
                Row: {
                    active: boolean
                    created_at: string
                    external_room_id: string | null
                    id: string
                    starts_at: string | null
                    status_type: Database["public"]["Enums"]["roomStatusType"]
                    topic_id: string
                    updated_at: string
                }
                Insert: {
                    active?: boolean
                    created_at?: string
                    external_room_id?: string | null
                    id?: string
                    starts_at?: string | null
                    status_type?: Database["public"]["Enums"]["roomStatusType"]
                    topic_id: string
                    updated_at?: string
                }
                Update: {
                    active?: boolean
                    created_at?: string
                    external_room_id?: string | null
                    id?: string
                    starts_at?: string | null
                    status_type?: Database["public"]["Enums"]["roomStatusType"]
                    topic_id?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "rooms_topic_id_topics_id_fk"
                        columns: ["topic_id"]
                        referencedRelation: "topics"
                        referencedColumns: ["id"]
                    }
                ]
            }
            topics: {
                Row: {
                    active: boolean
                    content: string
                    created_at: string
                    id: string
                    original_topic_id: string | null
                    type: Database["public"]["Enums"]["topicType"]
                    updated_at: string
                }
                Insert: {
                    active?: boolean
                    content?: string
                    created_at?: string
                    id?: string
                    original_topic_id?: string | null
                    type?: Database["public"]["Enums"]["topicType"]
                    updated_at?: string
                }
                Update: {
                    active?: boolean
                    content?: string
                    created_at?: string
                    id?: string
                    original_topic_id?: string | null
                    type?: Database["public"]["Enums"]["topicType"]
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "topics_original_topic_id_topics_id_fk"
                        columns: ["original_topic_id"]
                        referencedRelation: "topics"
                        referencedColumns: ["id"]
                    }
                ]
            }
            users: {
                Row: {
                    active: boolean
                    auth_user_id: string | null
                    created_at: string
                    demographics: Json
                    id: string
                    nick_name: string
                    updated_at: string
                }
                Insert: {
                    active?: boolean
                    auth_user_id?: string | null
                    created_at?: string
                    demographics?: Json
                    id?: string
                    nick_name?: string
                    updated_at?: string
                }
                Update: {
                    active?: boolean
                    auth_user_id?: string | null
                    created_at?: string
                    demographics?: Json
                    id?: string
                    nick_name?: string
                    updated_at?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            current_user_id: {
                Args: Record<PropertyKey, never>
                Returns: string
            }
            get_room_ids_by_user_ids: {
                Args: {
                    user_ids: string[]
                }
                Returns: unknown
            }
            ping_participant: {
                Args: {
                    participant_id: string
                }
                Returns: string
            }
        }
        Enums: {
            completionType: "gpt4" | "gpt"
            crossPollinationType: "outcome" | "topic"
            messageType: "chat" | "voice" | "bot"
            moderationType:
            | "harrashment"
            | "consensus"
            | "spam"
            | "off_topic"
            | "other"
            | "unequal"
            | "clarification"
            opinionOptionType:
            | "agree_consensus"
            | "disagree_consensus"
            | "agree"
            | "disagree"
            | "wrong"
            | "positive"
            | "negative"
            | "neutral"
            | "maybe"
            opinionType:
            | "relevance_range"
            | "agreement_range"
            | "statement"
            | "option"
            outcomeType:
            | "milestone"
            | "consensus"
            | "off_topic"
            | "overall_impression"
            | "topic_interest"
            | "cross_pollination"
            participantStatusType:
            | "queued"
            | "waiting_for_confirmation"
            | "transfering_to_room"
            | "in_room"
            | "end_of_session"
            roomStatusType:
            | "group_intro"
            | "safe"
            | "informed"
            | "debate"
            | "results"
            | "topic_intro"
            | "close"
            | "end"
            targetType:
            | "user"
            | "topic"
            | "room"
            | "participant"
            | "message"
            | "outcome"
            | "opinion"
            | "cross_pollination"
            | "completion"
            | "moderation"
            timingType: "before_room" | "during_room" | "after_room" | "standalone"
            topicType: "original" | "remixed"
            visibilityType: "public" | "private"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
