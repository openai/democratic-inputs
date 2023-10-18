import { createClient } from '@supabase/supabase-js';

import { SUPABASE_URL, SUPABASE_KEY } from "../config/constants";
import { Database } from '../generated/database-public.types';

export const supabaseClient = createClient<Database>(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
        db: {
            schema: 'public',
        },
        auth: {
            persistSession: false,
        }
    }
);

export type Room = Database["public"]["Tables"]["rooms"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Opinion = Database["public"]["Tables"]["opinions"]["Row"];
export type Participant = Database["public"]["Tables"]["participants"]["Row"];
export type Moderation = Database["public"]["Tables"]["moderations"]["Row"];
export type Outcome = Database["public"]["Tables"]["outcomes"]["Row"];
export type MessageType = Database['public']['Enums']['messageType'];
export type OutcomeType = Database["public"]["Enums"]["outcomeType"];
export type OpinionOptionType = Database["public"]["Enums"]["opinionOptionType"];

