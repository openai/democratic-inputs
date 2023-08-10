import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export default async function handler(req: any, res: any) {
  // console.log('SESSION: ', req.body.session.refresh_token);
  const supabase = createServerComponentClient({ cookies })
  await supabase.auth.setSession({
    access_token: '',
    refresh_token: '',
  });
  res.status(200).json({ message: 'success' });
}
