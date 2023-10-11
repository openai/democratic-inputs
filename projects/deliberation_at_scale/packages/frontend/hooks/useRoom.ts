import { useParams } from 'next/navigation';
import { alphabetical } from 'radash';

import { OutcomeType, ParticipantStatusType, RoomStatusType, useGetRoomOutcomesQuery, useGetRoomParticipantsQuery, useGetRoomsQuery } from "@/generated/graphql";
import useRealtimeQuery from "./useRealtimeQuery";
import { RoomId } from "@/state/slices/room";
import useRoomMessages from "./useRoomMessages";
import useProfile from './useProfile';
import { ENABLE_TEST_ROOM, ONE_SECOND_MS, TEST_EXTERNAL_ROOM_ID } from '@/utilities/constants';
import { useCallback, useMemo } from 'react';

export interface UseRoomOptions {
    roomId?: RoomId;
}

/**
 * A convenience function that will only return the external room id, so we
 * don't cause unnecessary re-renders in video outputs, leading to flickers.
 */
export function useExternalRoomId() {
    // Parse the roomId from the params
    const params = useParams();
    const roomId = params?.roomId as RoomId;

    // Retrieve the room from Supabase
    const { data: roomData } = useRealtimeQuery(useGetRoomsQuery({
        variables: {
            roomId,
        }
    }));

    // Find the correct node and room
    const roomNode = roomData?.roomsCollection?.edges?.find((roomEdge) => {
        return roomEdge?.node?.id === roomId;
    });
    const room = roomNode?.node;

    // Return the room Id
    return ENABLE_TEST_ROOM ? TEST_EXTERNAL_ROOM_ID : room?.external_room_id;
}

export default function useRoom(options?: UseRoomOptions) {
    const params = useParams();
    const paramsRoomId = params?.roomId as RoomId;
    const { roomId = paramsRoomId } = options ?? {};
    const { data: roomData, loading: loadingRooms, error: roomError } = useRealtimeQuery(useGetRoomsQuery({
        variables: {
            roomId,
        },
    }));
    const { data: participantsData, loading: loadingParticipants, error: participantsError } = useRealtimeQuery(useGetRoomParticipantsQuery({
        variables: {
            roomId,
        },
    }), {
        autoRefetch: !!roomId,
        autoRefetchIntervalMs: ONE_SECOND_MS * 10,
    });
    const participants = participantsData?.participantsCollection?.edges?.map(participant => participant.node);
    const participantIds = participants?.map(participant => participant.id);
    const { data: outcomesData } = useRealtimeQuery(useGetRoomOutcomesQuery({
        variables: {
            roomId,
        },
    }), {
        tableEventsLookup: {
            opinions: {
                listenFilters: {
                    INSERT: `participant_id=in.(${participantIds?.join(',')})`,
                }
            },
            outcomes: {
                listenFilters: {
                    INSERT: `room_id=in.(${roomId})`,
                }
            },
        },
    });
    const { user } = useProfile();
    const userId = user?.id;
    const roomNode = roomData?.roomsCollection?.edges?.find((roomEdge) => {
        return roomEdge?.node?.id === roomId;
    });
    const room = roomNode?.node;
    const roomStatus = room?.status_type;
    const externalRoomId = ENABLE_TEST_ROOM ? TEST_EXTERNAL_ROOM_ID : room?.external_room_id;
    const departedParticipants = participants?.filter(participant => participant.status === ParticipantStatusType.EndOfSession) ?? [];
    const joiningParticipants = participants?.filter(participant => participant.status === ParticipantStatusType.WaitingForConfirmation) ?? [];
    const participant = participants?.find(participant => participant.user_id === userId);
    const participantId = participant?.id;
    const outcomes = useMemo(() => {
        const nodes = outcomesData?.outcomesCollection?.edges?.map((outcome) => outcome.node) ?? [];
        const sortedNodes = alphabetical(nodes, (outcome) => outcome.created_at, 'desc');

        return sortedNodes;
    }, [outcomesData]);
    const roomMessagesTuple = useRoomMessages({ roomId, participants, userId });
    const topic = room?.topics;
    const topicId = topic?.id;
    const isRoomEnded = (RoomStatusType.End === roomStatus);
    const getOutcomeByType = useCallback((type: OutcomeType) => {
        const outcome = outcomes?.find((outcome) => {
            return outcome.type === type;
        });

        return outcome;
    }, [outcomes]);
    const hasOutcomeType = useCallback((type: OutcomeType) => {
        return !!getOutcomeByType(type);
    }, [getOutcomeByType]);

    return {

        // room
        room,
        externalRoomId,
        loadingRooms,
        roomError,
        roomId,
        roomStatus,
        isRoomEnded,

        // topic
        topic,
        topicId,

        // participants
        participants,
        participant,
        departedParticipants,
        joiningParticipants,
        participantId,
        loadingParticipants,
        participantsError,

        // outcomes
        outcomes,
        getOutcomeByType,
        hasOutcomeType,

        // messages
        ...roomMessagesTuple,
    };
}
