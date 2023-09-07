import { useCallback, useEffect, useState } from "react";
import { User } from "@supabase/gotrue-js";

import { supabaseClient } from "@/state/supabase";

export default function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const updateUser = useCallback(async () => {
        const { data: { user } } = await supabaseClient.auth.getUser();

        setUser(user);
    }, []);

    useEffect(() => {
        const { data: authListener } = supabaseClient.auth.onAuthStateChange(() => {
            updateUser();
        });
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [updateUser]);

    return {
        user,
    };
}
