
import { useCallback, useEffect, useState } from "react";
import { User } from "@supabase/gotrue-js";

import { supabaseClient } from "@/state/supabase";
import { useGetRoomsQuery, useGetUserQuery } from "@/generated/graphql";
import useRealtimeQuery from "./useRealtimeQuery";


// TODO: get current user
// TODO: if a user does not have a participant entry, create the participant entry
// TODO: ping every second to keep the connection alive this should probably be a different hook

export default function useLobby() {
    const [authUser, setAuthUser] = useState<User | null>(null);
    const authUserId = authUser?.id;
    const { data: usersData, refetch: refetchUser } = useRealtimeQuery(useGetUserQuery({
        variables: {
            authUserId,
        },
    }));

}
