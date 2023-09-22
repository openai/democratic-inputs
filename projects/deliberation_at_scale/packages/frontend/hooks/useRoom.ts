import { useParams } from 'next/navigation';

import { useGetRoomParticipantsQuery, useGetRoomsQuery } from "@/generated/graphql";
import useRealtimeQuery from "./useRealtimeQuery";
import { RoomId } from "@/state/slices/room";
import useRoomMessages from "./useRoomMessages";
import useProfile from './useProfile';

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
    const { user } = useProfile();
    const userId = user?.id;
    const roomNode = roomData?.roomsCollection?.edges?.find((roomEdge) => {
        return roomEdge?.node?.id === roomId;
    });
    const room = roomNode?.node;
    const roomStatus = room?.status_type;
    const participants = participantsData?.participantsCollection?.edges?.map(participant => participant.node);
    const currentParticipant = participants?.find(participant => participant.user_id === userId);
    const roomMessagesTuple = useRoomMessages({ roomId, participants, userId });
    const topic = room?.topics;

    return {
        room,

        loadingRooms,
        roomError,
        roomId,
        roomStatus,

        topic,

        participants,
        currentParticipant,
        loadingParticipants,
        participantsError,

        ...roomMessagesTuple,
    };
}
