'use client';
import useRoom from "@/hooks/useRoom";
import ChatMessageList from "./ChatMessageList";
import ChatInput from "./ChatInput";
import { useCallback, useEffect } from "react";
import { useSendRoomMessageMutation } from "@/generated/graphql";
import useScrollToBottom from "@/hooks/useScrollToBottom";
import { ONE_SECOND_MS } from "@/utilities/constants";
import { openRoomChat } from "@/state/slices/room";
import { useAppDispatch } from "@/state/store";
import useRoomActions from "@/hooks/useRoomActions";
import ChatActions from "./ChatActions";
import RoomTopic from "./RoomTopic";

export default function RoomChatMessages() {
    const { messages, participantId, roomId, messagesLoading } = useRoom();
    const { actions } = useRoomActions();
    const [sendRoomMessage, { loading: isSendingMessage }] = useSendRoomMessageMutation();
    const dispatch = useAppDispatch();
    const chatInputDisabled = isSendingMessage;
    const sendMessage = useCallback(async (content: string) => {
        const formattedMessage = content?.trim?.();

        if (isSendingMessage) {
            return false;
        }

        sendRoomMessage({
            variables: {
                content: formattedMessage,
                participantId,
                roomId,
            }
        });
        return true;
    }, [participantId, isSendingMessage, roomId, sendRoomMessage]);

    // automatically scroll the main container to the bottom on new messages
    const { scrollToBottom } = useScrollToBottom({ data: messages });

    // instantly scroll to the bottom when the messages are loaded
    useEffect(() => {
        if (!messagesLoading) {
            setTimeout(() => {
                scrollToBottom('instant');
            }, ONE_SECOND_MS * 0.05);
        }
    }, [messagesLoading, scrollToBottom]);

    // keep track of when this component was shown for the last time
    useEffect(() => {
        dispatch(openRoomChat());
    }, [dispatch]);

    return (
        <div className="flex flex-col shrink min-h-0 gap-2 pb-2 pt-2 px-4 grow">
            <RoomTopic />
            <ChatMessageList messages={messages} />
            <ChatActions actions={actions} />
            <ChatInput
                onSubmit={async (input) => {
                    return sendMessage(input.content);
                }}
                disabled={chatInputDisabled}
            />
        </div>
    );
}
