
import { useEffect, useMemo, useState } from "react";

import {
    useGetLobbyParticipantFromUserQuery,
    useCreateParticipantMutation,
    useEnterRoomMutation,
} from "@/generated/graphql";
import { usePingParticipant } from "./usePingParticipant";

enum ParticipantLoadingEnum {
    'notLoaded',
    'loading',
    'loaded',
}

/**
  * @brief: puts a user in a lobby. Will create a participant entry when none exist or return active participant when one does exist for this specific user.
**/
export default function useLobby(userId?: string) {
    const { data: participantData,
        loading: participantLoading,
        error: participantQueryError,
        refetch: participantRefetch,
    } = useGetLobbyParticipantFromUserQuery({ variables: { userId, } });
    const [participantIsLoaded, setParticipantIsLoaded] = useState(ParticipantLoadingEnum.notLoaded);
    const [transferToRoom, { loading: roomLoading }] = useEnterRoomMutation();


    // checks to see if the participant is loaded once. This makes sure that there is no weird async issues
    useEffect(() => {
        if (userId && participantLoading) {
            setParticipantIsLoaded(ParticipantLoadingEnum.loading);
        }
        if (userId && participantIsLoaded == ParticipantLoadingEnum.loading && !participantLoading) {
            setParticipantIsLoaded(ParticipantLoadingEnum.loaded);
        }

    }, [setParticipantIsLoaded, participantIsLoaded, userId, participantLoading]);

    const [
        createParticipant,
        {
            loading: loadingParticipantMutation,
            error: loadingParticipantError
        }
    ] = useCreateParticipantMutation({
        variables: {
            userId,
        }
    });

    const currentParticipant = useMemo(() => (
        participantData
            ?.participantsCollection
            ?.edges
            ?.[0]
            ?.node), [participantData]
    );

    useEffect(() => {
        if (!participantLoading && !currentParticipant && userId) {
            // create new participant
            createParticipant({
                variables: {
                    userId,
                }
            }).then((result) => {
                // eslint-disable-next-line no-console
                console.log("created participant", result);
            });
        }
    }, [participantLoading, currentParticipant, createParticipant, userId]);



    const transfertToRoomFn = async () => {
        const transferResult = await transferToRoom({
            variables: {
                participantID: currentParticipant?.id
            }
        });
        participantRefetch();
        return transferResult;
    };
    // pinging
    // const pingValues = usePingParticipant(currentParticipant?.id);
    usePingParticipant(currentParticipant?.id);
    return {
        participant: currentParticipant,
        loading: participantLoading || loadingParticipantMutation || roomLoading,
        error: loadingParticipantError || participantQueryError,
        transferToRoom: transfertToRoomFn,
    };
}

