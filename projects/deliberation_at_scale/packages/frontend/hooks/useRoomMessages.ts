import { alphabetical } from "radash";

import { MessageType, useGetRoomMessagesQuery } from "@/generated/graphql";
import useRealtimeQuery from "./useRealtimeQuery";
import { RoomId } from "@/state/slices/room";

export interface UseMessagesOptions {
    roomId: RoomId;
    participantMessageHistoryAmount?: number;
    botMessageHistoryAmount?: number;
}

export default function useRoomMessages(options?: UseMessagesOptions) {
    const {
        roomId,
        participantMessageHistoryAmount = 1,
        botMessageHistoryAmount = 1,
    } = options ?? {};
    const insertFilter = `room_id=eq.${roomId}`;
    const { data: messagesData } = useRealtimeQuery(useGetRoomMessagesQuery({ variables: { roomId } }), {
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
    const lastBotMessages = orderedMessages?.filter((message) => {
        return message?.node?.type === MessageType.Bot;
    }).slice(-1 * botMessageHistoryAmount);
    const lastParticipantMessages = orderedMessages?.filter((message) => {
        return message?.node?.type !== MessageType.Bot;
    }).slice(-1 * participantMessageHistoryAmount);

    return {
        messages: orderedMessages,
        lastBotMessages,
        lastParticipantMessages,
    };
}
