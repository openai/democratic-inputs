import { createClient } from '@supabase/supabase-js';

import { Database } from '../generated/database.types';
import { SUPABASE_URL, SUPABASE_KEY } from 'src/contants';

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
