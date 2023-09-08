import { alphabetical } from "radash";

import { useGetParticipantMessagesQuery } from "@/generated/graphql";
import useRealtimeQuery from "./useRealtimeQuery";
import { RoomId } from "@/state/slices/room";

export interface UseMessagesOptions {
  roomId?: RoomId;
}

export default function useMessages(options?: UseMessagesOptions) {
    const { roomId } = options ?? {};
    const insertFilter = (roomId ? `room_id=eq.(${roomId})` : undefined);
    const { data: messagesData } = useRealtimeQuery(useGetParticipantMessagesQuery(), {
        tableEventsLookup: {
            messages: {
                refetchOperations: [],
                appendOnInsertEdgePaths: ['messagesCollection'],
                listenFilters: {
                    INSERT: insertFilter,
                },
            },
        },
    });
    const messages = messagesData?.messagesCollection?.edges ?? [];
    const orderedMessages = alphabetical(
        messages,
        (message) => message.node.created_at,
        "asc"
    );

    return {
        messages: orderedMessages,
    };
}
