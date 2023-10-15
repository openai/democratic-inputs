import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from '@supabase/supabase-js';

const APP_URL = Deno.env.get('APP_URL') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const DEFAULT_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseAdminClient = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
);

interface RequestBody {
    identifier: string;
}

serve(async (req) => {

  // guard: handle options request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: DEFAULT_HEADERS });
  }

  // get the data from the request
  const {
    identifier,
  } = (await req.json() as RequestBody);
  console.log(`Received new request for ${identifier} to login anonymously.`);

  const { data } = await supabaseAdminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: `${identifier}@bmd.studio`,
    options: {
        redirectTo: APP_URL,
    },
  });

  console.log(`Generated login link for ${identifier}.`);
  return createResponse({
    loginLink: data.properties?.action_link,
  });
});

/**
 * Create a response with the given data.
 */
function createResponse(data: object) {
    return new Response(
        JSON.stringify(data),
        {
            headers: {
                "Content-Type": "application/json",
                ...DEFAULT_HEADERS,
            }
        },
    );
}
