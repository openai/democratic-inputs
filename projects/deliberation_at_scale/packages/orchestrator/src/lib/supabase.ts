// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import { createClient } from '@supabase/supabase-js';
import { Database } from '../data/database.types';

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            SUPABASE_URL: string;
            SUPABASE_KEY: string;
        }
    }
}

// GUARD: Double-check that both SUPABASE_URL and SUPABASE_KEY are part of the environment
if (!('SUPABASE_URL' in process.env)
    || !('SUPABASE_KEY' in process.env)
) {
    console.error('Please set SUPABASE_URL and/or SUPABASE_KEY in your environment or in your .env file.');
    process.exit(1);
}

const supabase = createClient<Database>(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY,
    {
        auth: {
            persistSession: false,
        }
    }
);

export default supabase;
