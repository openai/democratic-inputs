import { useCallback, useEffect, useState } from "react";
import { User } from "@supabase/gotrue-js";

import { supabaseClient } from "@/state/supabase";
import { useGetRoomsQuery, useGetUserQuery } from "@/generated/graphql";
import useRealtimeQuery from "./useRealtimeQuery";

export default function useProfile() {
    const [authUser, setAuthUser] = useState<User | null>(null);
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
        rooms,
    };
}
