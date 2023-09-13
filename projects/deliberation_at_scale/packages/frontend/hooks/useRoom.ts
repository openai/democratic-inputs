import { useGetRoomParticipantsQuery, useGetRoomsQuery } from "@/generated/graphql";
import useRealtimeQuery from "./useRealtimeQuery";
import { RoomId, RoomStatus } from "@/state/slices/room";
import useRoomMessages from "./useRoomMessages";

export interface UseRoomOptions {
    roomId: RoomId;
    roomStatus?: RoomStatus;
}

export default function useRoom(options: UseRoomOptions) {
    const { roomId, roomStatus } = options ?? {};
    const { data: roomData } = useRealtimeQuery(useGetRoomsQuery({
        variables: {
            roomId,
        }
    }));
    const { data: participantsData } = useRealtimeQuery(useGetRoomParticipantsQuery({
        variables: {
            roomId,
        },
    }));
    const roomNode = roomData?.roomsCollection?.edges?.find((roomEdge) => {
        return roomEdge?.node?.id === roomId;
    });
    const room = roomNode?.node;
    const participants = participantsData?.participantsCollection?.edges;
    const messages = useRoomMessages({ roomId });
    const topic = room?.topics;

    return {
        id: roomId,
        status: roomStatus,
        room,
        topic,
        participants,
        ...messages,
    };
}
