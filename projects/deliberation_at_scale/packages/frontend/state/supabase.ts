import { createClient } from '@supabase/supabase-js';

import { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } from '../utilities/constants';
import { Database } from '@/types/database';

export const supabaseClient = createClient<Database>(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY
);
