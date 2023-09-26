import { useParams } from 'next/navigation';

import { useGetRoomOutcomesQuery, useGetRoomParticipantsQuery, useGetRoomsQuery } from "@/generated/graphql";
import useRealtimeQuery from "./useRealtimeQuery";
import { RoomId } from "@/state/slices/room";
import useRoomMessages from "./useRoomMessages";
import useProfile from './useProfile';
import { ENABLE_TEST_ROOM, TEST_EXTERNAL_ROOM_ID } from '@/utilities/constants';

export interface UseRoomOptions {
    roomId?: RoomId;
}

export default function useRoom(options?: UseRoomOptions) {
    const params = useParams();
    const paramsRoomId = params?.roomId as RoomId;
    const { roomId = paramsRoomId } = options ?? {};
    const { data: roomData, loading: loadingRooms, error: roomError } = useRealtimeQuery(useGetRoomsQuery({
        variables: {
            roomId,
        }
    }));
    const { data: participantsData, loading: loadingParticipants, error: participantsError } = useRealtimeQuery(useGetRoomParticipantsQuery({
        variables: {
            roomId,
        },
    }));
    const { data: outcomesData } = useRealtimeQuery(useGetRoomOutcomesQuery({
        variables: {
            roomId,
        },
    }));
    const { user } = useProfile();
    const userId = user?.id;
    const roomNode = roomData?.roomsCollection?.edges?.find((roomEdge) => {
        return roomEdge?.node?.id === roomId;
    });
    const room = roomNode?.node;
    const roomStatus = room?.status_type;
    const externalRoomId = ENABLE_TEST_ROOM ? TEST_EXTERNAL_ROOM_ID : room?.external_room_id;
    const participants = participantsData?.participantsCollection?.edges?.map(participant => participant.node);
    const participant = participants?.find(participant => participant.user_id === userId);
    const participantId = participant?.id;
    const outcomes = outcomesData?.outcomesCollection?.edges?.map((outcome) => outcome.node);
    const roomMessagesTuple = useRoomMessages({ roomId, participants, userId });
    const topic = room?.topics;
    const topicId = topic?.id;

    return {

        // room info
        room,
        externalRoomId,
        loadingRooms,
        roomError,
        roomId,
        roomStatus,

        // topic info
        topic,
        topicId,

        // participants info
        participants,
        participant,
        participantId,
        loadingParticipants,
        participantsError,

        // outcomes info
        outcomes,

        // messages info
        ...roomMessagesTuple,
    };
}
