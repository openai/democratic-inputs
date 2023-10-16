import { useCallback, useEffect, useState } from "react";
import { msg } from "@lingui/macro";
import { useLingui } from '@lingui/react';

import { supabaseClient } from "@/state/supabase";
import { useGetRoomsQuery, useGetUserQuery } from "@/generated/graphql";
import useRealtimeQuery from "./useRealtimeQuery";
import { useAppDispatch, useAppSelector } from "@/state/store";
import { setAuthUser, setAuthSession } from "@/state/slices/profile";

export default function useProfile() {
    const { _ } = useLingui();
    const dispatch = useAppDispatch();
    const authUser = useAppSelector((state) => state.profile.authUser);
    const authSession = useAppSelector((state) => state.profile.authSession);
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
    const userId = user?.id;
    const rooms = roomsData?.roomsCollection?.edges;
    const isLoggedIn = !!authUser && !!user;
    const updateAuthUser = useCallback(async () => {
        setLoading(true);
        const { data: { user } } = await supabaseClient.auth.getUser();
        const { data: { session } } = await supabaseClient.auth.getSession();

        dispatch(setAuthUser(user));
        dispatch(setAuthSession(session));
        setLoading(false);
    }, [dispatch]);
    const flowStateNickName = useAppSelector((state) => state.flow.flowStateLookup?.['lobby']?.['nickName']);
    const nickName = flowStateNickName ?? user?.nick_name ?? _(msg`You`);

    useEffect(() => {
        const { data: authListener } = supabaseClient.auth.onAuthStateChange((event) => {
            if (!!authUser && !!authSession && event === 'INITIAL_SESSION') {
                return;
            }

            updateAuthUser();
        });
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [authSession, authUser, updateAuthUser]);

    useEffect(() => {
        refetchUser({
            authUserId,
        });
    }, [authUserId, refetchUser]);

    return {
        authUser,
        authSession,
        user,
        userId,
        nickName,
        rooms,
        loading,
        isLoggedIn,
    };
}
