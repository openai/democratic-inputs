import { useCallback, useEffect, useState } from "react";
import { User } from "@supabase/gotrue-js";

import { supabaseClient } from "@/state/supabase";
import { useGetUserQuery } from "@/generated/graphql";

export default function useAuth() {
    const [authUser, setAuthUser] = useState<User | null>(null);
    const authUserId = authUser?.id;
    const { data: usersData, refetch: refetchUser } = useGetUserQuery({
        variables: {
            authUserId,
        }
    });
    const user = usersData?.usersCollection?.edges?.[0]?.node;
    const updateAuthUser = useCallback(async () => {
        const { data: { user } } = await supabaseClient.auth.getUser();
        setAuthUser(user);
    }, []);

    useEffect(() => {
        const { data: authListener } = supabaseClient.auth.onAuthStateChange(() => {
            updateAuthUser();
        });
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [updateAuthUser]);

    useEffect(() => {
        refetchUser({
            authUserId,
        });
    }, [authUserId, refetchUser]);

    return {
        authUser,
        user,
    };
}
