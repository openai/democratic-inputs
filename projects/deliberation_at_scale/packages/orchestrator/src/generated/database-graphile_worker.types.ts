export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
    graphile_worker: {
        Tables: {
            job_queues: {
                Row: {
                    job_count: number
                    locked_at: string | null
                    locked_by: string | null
                    queue_name: string
                }
                Insert: {
                    job_count: number
                    locked_at?: string | null
                    locked_by?: string | null
                    queue_name: string
                }
                Update: {
                    job_count?: number
                    locked_at?: string | null
                    locked_by?: string | null
                    queue_name?: string
                }
                Relationships: []
            }
            jobs: {
                Row: {
                    attempts: number
                    created_at: string
                    flags: Json | null
                    id: number
                    key: string | null
                    last_error: string | null
                    locked_at: string | null
                    locked_by: string | null
                    max_attempts: number
                    payload: Json
                    priority: number
                    queue_name: string | null
                    revision: number
                    run_at: string
                    task_identifier: string
                    updated_at: string
                }
                Insert: {
                    attempts?: number
                    created_at?: string
                    flags?: Json | null
                    id?: number
                    key?: string | null
                    last_error?: string | null
                    locked_at?: string | null
                    locked_by?: string | null
                    max_attempts?: number
                    payload?: Json
                    priority?: number
                    queue_name?: string | null
                    revision?: number
                    run_at?: string
                    task_identifier: string
                    updated_at?: string
                }
                Update: {
                    attempts?: number
                    created_at?: string
                    flags?: Json | null
                    id?: number
                    key?: string | null
                    last_error?: string | null
                    locked_at?: string | null
                    locked_by?: string | null
                    max_attempts?: number
                    payload?: Json
                    priority?: number
                    queue_name?: string | null
                    revision?: number
                    run_at?: string
                    task_identifier?: string
                    updated_at?: string
                }
                Relationships: []
            }
            known_crontabs: {
                Row: {
                    identifier: string
                    known_since: string
                    last_execution: string | null
                }
                Insert: {
                    identifier: string
                    known_since: string
                    last_execution?: string | null
                }
                Update: {
                    identifier?: string
                    known_since?: string
                    last_execution?: string | null
                }
                Relationships: []
            }
            migrations: {
                Row: {
                    id: number
                    ts: string
                }
                Insert: {
                    id: number
                    ts?: string
                }
                Update: {
                    id?: number
                    ts?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            add_job: {
                Args: {
                    identifier: string
                    payload?: Json
                    queue_name?: string
                    run_at?: string
                    max_attempts?: number
                    job_key?: string
                    priority?: number
                    flags?: string[]
                    job_key_mode?: string
                }
                Returns: {
                    attempts: number
                    created_at: string
                    flags: Json | null
                    id: number
                    key: string | null
                    last_error: string | null
                    locked_at: string | null
                    locked_by: string | null
                    max_attempts: number
                    payload: Json
                    priority: number
                    queue_name: string | null
                    revision: number
                    run_at: string
                    task_identifier: string
                    updated_at: string
                }
            }
            complete_job: {
                Args: {
                    worker_id: string
                    job_id: number
                }
                Returns: {
                    attempts: number
                    created_at: string
                    flags: Json | null
                    id: number
                    key: string | null
                    last_error: string | null
                    locked_at: string | null
                    locked_by: string | null
                    max_attempts: number
                    payload: Json
                    priority: number
                    queue_name: string | null
                    revision: number
                    run_at: string
                    task_identifier: string
                    updated_at: string
                }
            }
            complete_jobs: {
                Args: {
                    job_ids: number[]
                }
                Returns: {
                    attempts: number
                    created_at: string
                    flags: Json | null
                    id: number
                    key: string | null
                    last_error: string | null
                    locked_at: string | null
                    locked_by: string | null
                    max_attempts: number
                    payload: Json
                    priority: number
                    queue_name: string | null
                    revision: number
                    run_at: string
                    task_identifier: string
                    updated_at: string
                }[]
            }
            fail_job: {
                Args: {
                    worker_id: string
                    job_id: number
                    error_message: string
                }
                Returns: {
                    attempts: number
                    created_at: string
                    flags: Json | null
                    id: number
                    key: string | null
                    last_error: string | null
                    locked_at: string | null
                    locked_by: string | null
                    max_attempts: number
                    payload: Json
                    priority: number
                    queue_name: string | null
                    revision: number
                    run_at: string
                    task_identifier: string
                    updated_at: string
                }
            }
            get_job: {
                Args: {
                    worker_id: string
                    task_identifiers?: string[]
                    job_expiry?: unknown
                    forbidden_flags?: string[]
                    now?: string
                }
                Returns: {
                    attempts: number
                    created_at: string
                    flags: Json | null
                    id: number
                    key: string | null
                    last_error: string | null
                    locked_at: string | null
                    locked_by: string | null
                    max_attempts: number
                    payload: Json
                    priority: number
                    queue_name: string | null
                    revision: number
                    run_at: string
                    task_identifier: string
                    updated_at: string
                }
            }
            permanently_fail_jobs: {
                Args: {
                    job_ids: number[]
                    error_message?: string
                }
                Returns: {
                    attempts: number
                    created_at: string
                    flags: Json | null
                    id: number
                    key: string | null
                    last_error: string | null
                    locked_at: string | null
                    locked_by: string | null
                    max_attempts: number
                    payload: Json
                    priority: number
                    queue_name: string | null
                    revision: number
                    run_at: string
                    task_identifier: string
                    updated_at: string
                }[]
            }
            remove_job: {
                Args: {
                    job_key: string
                }
                Returns: {
                    attempts: number
                    created_at: string
                    flags: Json | null
                    id: number
                    key: string | null
                    last_error: string | null
                    locked_at: string | null
                    locked_by: string | null
                    max_attempts: number
                    payload: Json
                    priority: number
                    queue_name: string | null
                    revision: number
                    run_at: string
                    task_identifier: string
                    updated_at: string
                }
            }
            reschedule_jobs: {
                Args: {
                    job_ids: number[]
                    run_at?: string
                    priority?: number
                    attempts?: number
                    max_attempts?: number
                }
                Returns: {
                    attempts: number
                    created_at: string
                    flags: Json | null
                    id: number
                    key: string | null
                    last_error: string | null
                    locked_at: string | null
                    locked_by: string | null
                    max_attempts: number
                    payload: Json
                    priority: number
                    queue_name: string | null
                    revision: number
                    run_at: string
                    task_identifier: string
                    updated_at: string
                }[]
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
