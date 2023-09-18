import { createClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';

import { SUPABASE_URL, SUPABASE_KEY } from "../config/constants";
import { Database, Json } from 'src/generated/database-public.types';

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
export type MessageType = Database['public']['Enums']['messageType'];

