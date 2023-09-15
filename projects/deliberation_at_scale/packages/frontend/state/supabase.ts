import { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } from '../utilities/constants';
import { Database } from '@/types/database';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const supabaseClient = createClientComponentClient<Database>({
    supabaseKey: NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseUrl: NEXT_PUBLIC_SUPABASE_URL,
});