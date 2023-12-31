import { useCallback, useEffect, useMemo, useState } from "react";

import {
    ParticipantStatusType,
    useCreateParticipantMutation,
    useEnterRoomMutation,
    useGetLobbyParticipantsQuery,
} from "@/generated/graphql";
import { usePingParticipant } from "./usePingParticipant";
import useProfile from "./useProfile";
import useRealtimeQuery from "./useRealtimeQuery";
import useLocalizedPush from "./useLocalizedPush";
import dayjs, { Dayjs } from "dayjs";
// import { ONE_SECOND_MS } from "@/utilities/constants";

export default function useLobby() {
    const { user, nickName } = useProfile();
    const { id: userId } = user ?? {};
    const [confirmingParticipantId, setConfirmingParticipantId] = useState<string | null>(null);
    const [lastCreatedAt, setLastCreatedAt] = useState<Dayjs | null>(null);
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
    const [createParticipant, { loading: isCreatingParticipant }] = useCreateParticipantMutation();
    const [enterRoomMutation, { loading: isEnteringRoom }] = useEnterRoomMutation();
    const participants = useMemo(() => {
        return participantData?.participantsCollection?.edges?.map((edge) => edge?.node) ?? [];
    }, [participantData?.participantsCollection?.edges]);
    const candidateParticipant = participants.find((participant) => {
        return participant?.status === ParticipantStatusType.Queued || participant?.status === ParticipantStatusType.WaitingForConfirmation;
    });
    const candidateParticipantId = candidateParticipant?.id;
    const candidateRoomId = candidateParticipant?.room_id;
    const confirmingParticipant = participants.find((participant) => participant?.id === confirmingParticipantId);
    const canEnterRoom = !!confirmingParticipantId && (confirmingParticipant?.status === ParticipantStatusType.WaitingForConfirmation);
    const { push } = useLocalizedPush();
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
            // eslint-disable-next-line no-console
            console.error('Could not enter room for participant ID: ', candidateParticipantId);
            return;
        }

        push(`/room/${roomId}`);
    }, [candidateParticipantId, enterRoomMutation, push]);

    // ping the participant entry to make sure it is still alive for the group slicer
    usePingParticipant(candidateParticipant);
    usePingParticipant(confirmingParticipant);

    // create a queued participant when the user has none yet
    // block this when no valid user is found OR when we are already waiting for a confirm
    useEffect(() => {
        const hasValidCandidate = !!candidateParticipant
            && candidateParticipant.status !== ParticipantStatusType.EndOfSession
            && candidateParticipant.active === true;
            // && Math.abs(dayjs().diff(dayjs(lastCreatedAt), 'ms')) <= ONE_SECOND_MS * 60 * 2;

        if (participantsLoading || hasValidCandidate || !userId || isConfirming || isCreatingParticipant) {
            return;
        }

        // create new participant
        setLastCreatedAt(dayjs());
        createParticipant({
            variables: {
                userId,
                nickName,
            },
        }).then(() => {
            refetchParticipants();
        });
    }, [participantsLoading, candidateParticipant, createParticipant, userId, refetchParticipants, isConfirming, isCreatingParticipant, setLastCreatedAt, lastCreatedAt, nickName]);

    // store the the participant ID when a confirm is requested
    // this will help us redirect the user back to the timed out flow when not responding quickly enough
    useEffect(() => {
        if (candidateParticipant?.status === ParticipantStatusType.WaitingForConfirmation) {
            setConfirmingParticipantId(candidateParticipantId);
        }
    }, [candidateParticipant, setConfirmingParticipantId, candidateParticipantId]);

    // navigate to the page to mention the timeout
    useEffect(() => {
        // console.log('isConfirming', isConfirming);
        // console.log('confirmingParticipantId', confirmingParticipantId);
        // console.log('confirmingParticipant', confirmingParticipant);
        // console.log('candidateParticipant', candidateParticipant);
        // console.log('participants', participants);

        if (isConfirming && (!confirmingParticipant || confirmingParticipant.status === ParticipantStatusType.EndOfSession)) {
            push('/lobby/idle');
        }
    }, [confirmingParticipant, confirmingParticipantId, isConfirming, participants, candidateParticipant, push]);

    // refetch participants when the user id changes
    useEffect(() => {
        refetchParticipants();
    }, [userId, refetchParticipants]);

    return {
        candidateParticipant,
        candidateRoomId,
        canEnterRoom,
        isConfirming,
        confirmingParticipant,
        isEnteringRoom,
        enterRoom,
    };
}

