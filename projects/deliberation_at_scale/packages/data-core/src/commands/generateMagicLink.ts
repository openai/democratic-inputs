import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_SERVICE_API_KEY } from "../config/constants";

const supabaseAdminClient = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_API_KEY
);

async function main() {
    const { data } = await supabaseAdminClient.auth.admin.generateLink({
        type: 'magiclink',
        email: 'hello@bmd.studio',
        options: {
            redirectTo: 'http://localhost:3200',
        },
    });

    console.log(data);
}

(async () => {
    main();
})();
