import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
    const [confirmingParticipantId, setConfirmingParticipantId] = useState<string | null>(null);
    const isConfirming = !!confirmingParticipantId;
    const { data: participantData,
        loading: participantsLoading,
        refetch: rawRefetchParticipants,
    } = useRealtimeQuery(useGetLobbyParticipantsQuery({
        variables: {
            userId,
        },
    }));
    const refetchParticipants = useCallback(() => {
        rawRefetchParticipants({
            variables: {
                userId,
            },
        });
    }, [rawRefetchParticipants, userId]);
    const [createParticipant] = useCreateParticipantMutation();
    const [enterRoomMutation, { loading: isEnteringRoom }] = useEnterRoomMutation();
    const candidateParticipant = participantData?.participantsCollection?.edges?.[0]?.node;
    const candidateParticipantId = candidateParticipant?.id;
    const candidateRoomId = candidateParticipant?.room_id;
    const canEnterRoom = !!candidateRoomId && (candidateParticipant?.status === ParticipantStatusType.WaitingForConfirmation);
    const { push } = useRouter();
    const enterRoom = useCallback(async () => {
        const enterResult = await enterRoomMutation({
            variables: {
                participantId: candidateParticipantId,
            },
        });
        const isEntered = (enterResult.data?.updateparticipantsCollection?.affectedCount ?? 0) > 0;
        const roomId = enterResult.data?.updateparticipantsCollection.records[0]?.room_id;

        if (!isEntered || !roomId) {
            // TODO: handle not being able to enter room?
            console.error('Could not enter room for participant ID: ', candidateParticipantId);
            return;
        }

        push(`/room/${roomId}`);
    }, [candidateParticipantId, enterRoomMutation, push]);

    // ping the participant entry to make sure it is still alive for the group slicer
    usePingParticipant(candidateParticipant);

    // create a queued participant when the user has none yet
    // block this when no valid user is found OR when we are already waiting for a confirm
    useEffect(() => {
        if (participantsLoading || !!candidateParticipant || !userId || confirmingParticipantId) {
            return;
        }

        // create new participant
        createParticipant({
            variables: {
                userId,
            },
        }).then(() => {
            refetchParticipants();
        });
    }, [participantsLoading, candidateParticipant, createParticipant, userId, refetchParticipants, confirmingParticipantId]);

    // store the the participant ID when a confirm is requested
    // this will help us redirect the user back to the timeed out flow when not responding quickly enough
    useEffect(() => {
        if (candidateParticipant?.status !== ParticipantStatusType.WaitingForConfirmation) {
            return;
        }

        setConfirmingParticipantId(candidateParticipantId);
    }, [candidateParticipant, setConfirmingParticipantId, candidateParticipantId]);

    // navigate to the page to mention the timeout
    useEffect(() => {
        if (isConfirming && (!candidateParticipant || candidateParticipant.status === ParticipantStatusType.EndOfSession )) {
            push('/lobby/idle');
        }
    }, [candidateParticipant, isConfirming, push]);

    // refetch participants when the user id changes
    useEffect(() => {
        refetchParticipants();
    }, [userId, refetchParticipants]);

    return {
        candidateParticipant,
        candidateRoomId,
        canEnterRoom,
        isEnteringRoom,
        enterRoom,
    };
}

