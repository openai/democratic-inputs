import { createClient } from '@supabase/supabase-js';

import { Database } from '../generated/database.types';
import { SUPABASE_URL, SUPABASE_KEY } from "../constants";

const supabaseClient = createClient<Database>(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
        auth: {
            persistSession: false,
        }
    }
);

export default supabaseClient;
