
import { useCallback, useEffect, useState } from "react";
import { User } from "@supabase/gotrue-js";

import { supabaseClient } from "@/state/supabase";
import { useGetRoomsQuery, useGetUserQuery, useGetParticipantFromUserQuery, GetLobbyParticipantFromUserDocument, useGetLobbyParticipantFromUserQuery, useCreateParticipantMutation } from "@/generated/graphql";
import useRealtimeQuery from "./useRealtimeQuery";
import { useLazyQuery, useQuery } from "@apollo/client";


// TODO: get current user
// TODO: if a user does not have a participant entry, create the participant entry
// TODO: ping every second to keep the connection alive this should probably be a different hook

export default function useLobby(userId: string) {
    const {data: participantData, refetch: refetchParticipant, loading: participantLoading} = useRealtimeQuery(useGetLobbyParticipantFromUserQuery({
        variables: {
            userId,
        }
    }));

    console.log({userId});
    const [createParticipant, {loading: loadingParticipantMutation, error: loadingParticipantError}] = useCreateParticipantMutation({
        variables : {
            userId,
        }
    });
    const currentParticipant = participantData?.participantsCollection?.edges?.[0]?.node;
    useEffect(() => {
        if(!participantLoading && !currentParticipant) {
            console.log("stopped loading and no new currenparticipant");
            // create new participant
             createParticipant({variables: {
                userId,
            }}).then((result) => {
                console.log({result});
            });
        }
        console.log({participantLoading, currentParticipant});
    }, [participantLoading, currentParticipant]);

    useEffect(() => {
        refetchParticipant( {
            userId,
        });
    }, [userId]);


    useCallback(() => {
        
    }, [userId]);

    return {
        participant: currentParticipant,
        loading: participantLoading || loadingParticipantMutation,
        error: loadingParticipantError
    }

}
