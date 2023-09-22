
import { useCallback, useEffect } from "react";

import {
    ParticipantStatusType,
    useCreateParticipantMutation,
    useEnterRoomMutation,
    useGetLobbyParticipantsQuery,
} from "@/generated/graphql";
import { usePingParticipant } from "./usePingParticipant";
import useProfile from "./useProfile";
import useRealtimeQuery from "./useRealtimeQuery";

export default function useLobby() {
    const { user } = useProfile();
    const { id: userId } = user ?? {};
    const { data: participantData,
        loading: participantLoading,
        refetch: refetchParticipants,
    } = useRealtimeQuery(useGetLobbyParticipantsQuery({
        variables: {
            userId,
        },
    }));
    const [createParticipant] = useCreateParticipantMutation();
    const [enterRoomMutation, { loading: isEnteringRoom }] = useEnterRoomMutation();
    const currentParticipant = participantData?.participantsCollection?.edges?.[0]?.node;
    const currentParticipantId = currentParticipant?.id;
    const enterRoom = useCallback(async () => {
        const enterResult = await enterRoomMutation({
            variables: {
                participantId: currentParticipantId,
            },
        });
        const isEntered = (enterResult.data?.updateparticipantsCollection?.affectedCount ?? 0) > 0;
        refetchParticipants();

        return isEntered;
    }, [currentParticipantId, enterRoomMutation, refetchParticipants]);
    const canEnterRoom = (currentParticipant?.status === ParticipantStatusType.WaitingForConfirmation);

    // ping the participant entry to make sure it is still alive for the group slicer
    usePingParticipant(currentParticipantId);

    // create a queued participant when the user has none yet
    useEffect(() => {
        if (participantLoading || currentParticipant || !userId) {
            return;
        }

        // create new participant
        createParticipant({
            variables: {
                userId,
            }
        });
    }, [participantLoading, currentParticipant, createParticipant, userId]);

    return {
        participant: currentParticipant,
        canEnterRoom,
        isEnteringRoom,
        enterRoom,
    };
}

