import { createClient } from '@supabase/supabase-js';

import { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } from './constants';
import { Database } from '@/types/database';

export const supabase = createClient<Database>(
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY
);
