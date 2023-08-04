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
      discussions: {
        Row: {
          active: boolean
          content: string
          created_at: string
          id: string
          participant_id: string | null
          type: Database["public"]["Enums"]["discussionType"]
          updated_at: string
        }
        Insert: {
          active?: boolean
          content?: string
          created_at?: string
          id?: string
          participant_id?: string | null
          type?: Database["public"]["Enums"]["discussionType"]
          updated_at?: string
        }
        Update: {
          active?: boolean
          content?: string
          created_at?: string
          id?: string
          participant_id?: string | null
          type?: Database["public"]["Enums"]["discussionType"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussions_participant_id_participants_id_fk"
            columns: ["participant_id"]
            referencedRelation: "participants"
            referencedColumns: ["id"]
          }
        ]
      }
      opinions: {
        Row: {
          active: boolean
          created_at: string
          id: string
          range_value: number
          statement: string
          type: Database["public"]["Enums"]["opinionType"]
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          range_value?: number
          statement?: string
          type?: Database["public"]["Enums"]["opinionType"]
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          range_value?: number
          statement?: string
          type?: Database["public"]["Enums"]["opinionType"]
          updated_at?: string
        }
        Relationships: []
      }
      outcome_sources: {
        Row: {
          created_at: string
          discussion_id: string
          id: string
          outcome_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          discussion_id: string
          id?: string
          outcome_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          discussion_id?: string
          id?: string
          outcome_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "outcome_sources_discussion_id_discussions_id_fk"
            columns: ["discussion_id"]
            referencedRelation: "discussions"
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
          created_at: string
          id: string
          type: Database["public"]["Enums"]["outcomeType"]
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          type?: Database["public"]["Enums"]["outcomeType"]
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          type?: Database["public"]["Enums"]["outcomeType"]
          updated_at?: string
        }
        Relationships: []
      }
      participants: {
        Row: {
          active: boolean
          created_at: string
          id: string
          nick_name: string
          room_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          nick_name?: string
          room_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          nick_name?: string
          room_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "participants_room_id_rooms_id_fk"
            columns: ["room_id"]
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          }
        ]
      }
      rooms: {
        Row: {
          active: boolean
          created_at: string
          id: string
          started_at: string
          topic_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          started_at?: string
          topic_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          started_at?: string
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
          created_at: string
          id: string
          nick_name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          nick_name?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
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
      [_ in never]: never
    }
    Enums: {
      discussionType: "chat" | "voice" | "bot"
      opinionType: "relevance_range" | "agreement_range" | "statement"
      outcomeType: "milestone" | "consensus" | "off_topic"
      topicType: "original" | "remixed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
