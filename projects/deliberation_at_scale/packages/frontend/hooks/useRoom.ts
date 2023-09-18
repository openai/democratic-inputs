import { useGetRoomParticipantsQuery, useGetRoomsQuery } from "@/generated/graphql";
import useRealtimeQuery from "./useRealtimeQuery";
import { RoomId } from "@/state/slices/room";
import useRoomMessages from "./useRoomMessages";

export interface UseRoomOptions {
    roomId: RoomId;
}

export default function useRoom(options: UseRoomOptions) {
    const { roomId } = options ?? {};
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
    const roomStatus = room?.status_type;
    const participants = participantsData?.participantsCollection?.edges;
    const messages = useRoomMessages({ roomId });
    const topic = room?.topics;

    return {
        roomId,
        roomStatus,
        room,
        topic,
        participants,
        ...messages,
    };
}
