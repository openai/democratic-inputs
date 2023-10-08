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

export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Moderation = Database["public"]["Tables"]["moderations"]["Row"];
export type Outcome = Database["public"]["Tables"]["outcomes"]["Row"];
export type MessageType = Database['public']['Enums']['messageType'];
export type OutcomeType = Database["public"]["Enums"]["outcomeType"];

