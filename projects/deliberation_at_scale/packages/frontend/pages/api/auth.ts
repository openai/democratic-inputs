import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextApiRequest, NextApiResponse } from 'next';
import { cookies } from 'next/headers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const supabase = createServerComponentClient({ cookies });
    await supabase.auth.setSession({
        access_token: '',
        refresh_token: '',
    });
    res.status(200).json({ message: 'success' });
}
