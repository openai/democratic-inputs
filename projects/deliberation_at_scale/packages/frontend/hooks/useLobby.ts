
import { useEffect, useMemo } from "react";

import {
    useGetLobbyParticipantFromUserQuery,
    useCreateParticipantMutation,
    usePingParticipantMutation,
} from "@/generated/graphql";
import useRealtimeQuery from "./useRealtimeQuery";


// TODO: get current user
// TODO: if a user does not have a participant entry, create the participant entry
// TODO: ping every second to keep the connection alive this should probably be a different hook

export default function useLobby(userId: string) {
    const { data: participantData, refetch: refetchParticipant, loading: participantLoading } = useRealtimeQuery(useGetLobbyParticipantFromUserQuery({
        variables: {
            userId,
        }
    }));

    const [createParticipant, { loading: loadingParticipantMutation, error: loadingParticipantError }] = useCreateParticipantMutation({
        variables: {
            userId,
        }
    });
    const currentParticipant = useMemo(() => (participantData?.participantsCollection?.edges?.[0]?.node), [participantData]);

    useEffect(() => {
        if (!participantLoading && !currentParticipant) {
            // create new participant
            createParticipant({
                variables: {
                    userId,
                }
            }).then((result) => {
                console.log("created participant", result);
            });
        }
    }, [participantLoading, currentParticipant, createParticipant, userId]);

    useEffect(() => {
        refetchParticipant({
            userId,
        });
    }, [userId, refetchParticipant]);

    // pinging
    // const pingValues = usePingParticipant(currentParticipant?.id);
    usePingParticipant(currentParticipant?.id);

    console.log({ userId, participantID: currentParticipant?.id, currentParticipant });
    return {
        participant: currentParticipant,
        loading: participantLoading || loadingParticipantMutation,
        error: loadingParticipantError,
        // ping: pingValues,
    };

}

const PING_INTERVAL_DELAY_MS = 1000;

export function usePingParticipant(participantID?: string) {
    const [ping, { loading, error, data }] = usePingParticipantMutation();
    // const [ping, { loading, error, data }] = useMutation(PingParticipantDocument);
    useEffect(() => {
        // guard
        if (!participantID) {
            return;
        }

        // if has participant ID set interval
        const timer = setInterval(() => {
            ping({
                variables: {
                    participantID,
                    updateTime: new Date().toISOString(),
                }
            });
            console.log("ping", new Date().toISOString());
        }, PING_INTERVAL_DELAY_MS);

        return (() => {
            clearInterval(timer);
        });
    }, [participantID, ping]);
    useEffect(() => {
        if (error) {
            console.error(error);
        }
    }, [error]
    );

    return { loading, error, data };
}
