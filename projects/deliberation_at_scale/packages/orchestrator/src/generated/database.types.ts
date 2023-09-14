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
          cross_pollination_id: string | null
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
          cross_pollination_id?: string | null
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
          cross_pollination_id?: string | null
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
            foreignKeyName: "completions_cross_pollination_id_cross_pollinations_id_fk"
            columns: ["cross_pollination_id"]
            referencedRelation: "cross_pollinations"
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
      cross_pollinations: {
        Row: {
          active: boolean
          created_at: string
          id: string
          outcome_id: string | null
          participant_id: string | null
          room_id: string | null
          timing_type: Database["public"]["Enums"]["timingType"]
          topic_id: string | null
          type: Database["public"]["Enums"]["crossPollinationType"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          outcome_id?: string | null
          participant_id?: string | null
          room_id?: string | null
          timing_type?: Database["public"]["Enums"]["timingType"]
          topic_id?: string | null
          type: Database["public"]["Enums"]["crossPollinationType"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          outcome_id?: string | null
          participant_id?: string | null
          room_id?: string | null
          timing_type?: Database["public"]["Enums"]["timingType"]
          topic_id?: string | null
          type?: Database["public"]["Enums"]["crossPollinationType"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cross_pollinations_outcome_id_outcomes_id_fk"
            columns: ["outcome_id"]
            referencedRelation: "outcomes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cross_pollinations_participant_id_participants_id_fk"
            columns: ["participant_id"]
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cross_pollinations_room_id_messages_id_fk"
            columns: ["room_id"]
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cross_pollinations_topic_id_topics_id_fk"
            columns: ["topic_id"]
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cross_pollinations_user_id_users_id_fk"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          active: boolean
          content: string
          created_at: string
          embeddings: Json
          id: string
          original_message_id: string | null
          participant_id: string | null
          room_id: string | null
          timing_type: Database["public"]["Enums"]["timingType"]
          type: Database["public"]["Enums"]["messageType"]
          updated_at: string
          visibility_type: Database["public"]["Enums"]["visibilityType"]
        }
        Insert: {
          active?: boolean
          content?: string
          created_at?: string
          embeddings?: Json
          id?: string
          original_message_id?: string | null
          participant_id?: string | null
          room_id?: string | null
          timing_type?: Database["public"]["Enums"]["timingType"]
          type?: Database["public"]["Enums"]["messageType"]
          updated_at?: string
          visibility_type?: Database["public"]["Enums"]["visibilityType"]
        }
        Update: {
          active?: boolean
          content?: string
          created_at?: string
          embeddings?: Json
          id?: string
          original_message_id?: string | null
          participant_id?: string | null
          room_id?: string | null
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
          completion_id: string | null
          created_at: string
          cross_pollination_id: string | null
          id: string
          message_id: string | null
          moderation_id: string | null
          opinion_id: string | null
          outcome_id: string | null
          participant_id: string | null
          room_id: string | null
          statement: string
          target_type: Database["public"]["Enums"]["targetType"] | null
          topic_id: string | null
          type: Database["public"]["Enums"]["moderationType"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active?: boolean
          completion_id?: string | null
          created_at?: string
          cross_pollination_id?: string | null
          id?: string
          message_id?: string | null
          moderation_id?: string | null
          opinion_id?: string | null
          outcome_id?: string | null
          participant_id?: string | null
          room_id?: string | null
          statement?: string
          target_type?: Database["public"]["Enums"]["targetType"] | null
          topic_id?: string | null
          type: Database["public"]["Enums"]["moderationType"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean
          completion_id?: string | null
          created_at?: string
          cross_pollination_id?: string | null
          id?: string
          message_id?: string | null
          moderation_id?: string | null
          opinion_id?: string | null
          outcome_id?: string | null
          participant_id?: string | null
          room_id?: string | null
          statement?: string
          target_type?: Database["public"]["Enums"]["targetType"] | null
          topic_id?: string | null
          type?: Database["public"]["Enums"]["moderationType"]
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
            foreignKeyName: "moderations_cross_pollination_id_cross_pollinations_id_fk"
            columns: ["cross_pollination_id"]
            referencedRelation: "cross_pollinations"
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
          outcome_id: string | null
          range_value: number
          statement: string
          type: Database["public"]["Enums"]["opinionType"]
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          outcome_id?: string | null
          range_value?: number
          statement?: string
          type?: Database["public"]["Enums"]["opinionType"]
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          outcome_id?: string | null
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
          type: Database["public"]["Enums"]["outcomeType"]
          updated_at: string
        }
        Insert: {
          active?: boolean
          content?: string
          created_at?: string
          id?: string
          original_outcome_id?: string | null
          type?: Database["public"]["Enums"]["outcomeType"]
          updated_at?: string
        }
        Update: {
          active?: boolean
          content?: string
          created_at?: string
          id?: string
          original_outcome_id?: string | null
          type?: Database["public"]["Enums"]["outcomeType"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "outcomes_original_outcome_id_outcomes_id_fk"
            columns: ["original_outcome_id"]
            referencedRelation: "outcomes"
            referencedColumns: ["id"]
          }
        ]
      }
      participants: {
        Row: {
          active: boolean
          created_at: string
          id: string
          nick_name: string
          participation_score: number
          ready: boolean
          room_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          nick_name?: string
          participation_score?: number
          ready?: boolean
          room_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          nick_name?: string
          participation_score?: number
          ready?: boolean
          room_id?: string | null
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
    }
    Enums: {
      completionType: "gpt4" | "gpt"
      crossPollinationType: "discussion" | "closing" | "afterwards"
      discussionType: "chat" | "voice" | "bot"
      messageType: "chat" | "voice" | "bot"
      moderationType:
        | "harrashment"
        | "spam"
        | "off_topic"
        | "other"
        | "consensus"
        | "unequal"
        | "clarification"
      opinionType: "relevance_range" | "agreement_range" | "statement"
      outcomeType: "milestone" | "consensus" | "off_topic"
      roomStatusType: "introduction_participants" | "introduction_topic" | "safe" | "informed" | "conversate" | "results" | "conclude"
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
