import { cookies } from 'next/headers';
import { Database } from '@/types/database';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';

export interface UseAuthProps {
    require?: 'authenticated' | 'unauthenticated';
    redirectTo?: string;
}

/**
 * A server-side hook to check if the user is logged in
 */
export default async function useAuth(
    require: 'authenticated' | 'unauthenticated' = 'authenticated',
    redirectTo: string = '/login'
) {
    // Instantiate the server-side Supabase client
    const supabase = createServerComponentClient<Database>({ cookies });
    const { data } = await supabase.auth.getSession();

    // GUARD: Check if the user is in the right authentication state. If they're
    // not, redirect to another URL.
    if ((require === 'authenticated' && !data.session)
        || (require === 'unauthenticated' && !!data.session)) {
        redirect(redirectTo);
    }
}