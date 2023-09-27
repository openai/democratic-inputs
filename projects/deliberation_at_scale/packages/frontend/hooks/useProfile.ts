import { useCallback, useEffect, useState } from "react";
import { User } from "@supabase/gotrue-js";

import { supabaseClient } from "@/state/supabase";
import { useGetRoomsQuery, useGetUserQuery } from "@/generated/graphql";
import useRealtimeQuery from "./useRealtimeQuery";
import { Session } from "@supabase/supabase-js";

export default function useProfile() {
    const [authUser, setAuthUser] = useState<User | null>(null);
    const [authSession, setAuthSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const authUserId = authUser?.id;
    const { data: usersData, refetch: refetchUser } = useRealtimeQuery(useGetUserQuery({
        variables: {
            authUserId,
        },
    }));
    const { data: roomsData } = useRealtimeQuery(useGetRoomsQuery(), {
        tableEventsLookup: {
            rooms: {
                //refetchOperations: [],
                //appendOnInsertEdgePaths: ['roomsCollection'],
            },
        },
    });
    const user = usersData?.usersCollection?.edges?.[0]?.node;
    const rooms = roomsData?.roomsCollection?.edges;

    const updateAuthUser = useCallback(async () => {
        setLoading(true);
        const { data: { user } } = await supabaseClient.auth.getUser();
        const { data: { session } } = await supabaseClient.auth.getSession();

        setAuthUser(user);
        setAuthSession(session);
        setLoading(false);
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
        authSession,
        user,
        rooms,
        loading,
    };
}
