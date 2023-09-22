'use client';
import useRoom from "@/hooks/useRoom";
import ChatMessageList from "./ChatMessageList";
import ChatInput from "./ChatInput";
import { useCallback, useEffect } from "react";
import { useSendRoomMessageMutation } from "@/generated/graphql";
import useScrollToBottom from "@/hooks/useScrollToBottom";

export default function RoomChatMessages() {
    const { messages, currentParticipant, roomId, messagesLoading } = useRoom();
    const [sendRoomMessage, { loading: isSendingMessage }] = useSendRoomMessageMutation();
    const { id: currentParticipantId } = currentParticipant ?? {};
    const chatInputDisabled = isSendingMessage;
    const sendMessage = useCallback(async (content: string) => {
        const formattedMessage = content?.trim?.();

        if (isSendingMessage) {
            return false;
        }

        sendRoomMessage({
            variables: {
                content: formattedMessage,
                participantId: currentParticipantId,
                roomId,
            }
        });
        return true;
    }, [currentParticipantId, isSendingMessage, roomId, sendRoomMessage]);

    // automatically scroll the main container to the bottom on new messages
    const { scrollToBottom } = useScrollToBottom({ data: messages });

    // instantly scroll to the bottom when the messages are loaded
    useEffect(() => {
        if (!messagesLoading) {
            scrollToBottom('instant');
        }
    }, [messagesLoading, scrollToBottom]);

    return (
        <>
            <div className="flex flex-col w-full h-full pb-10">
                <div className="grow">
                    <ChatMessageList messages={messages} />
                </div>
            </div>
            <div className="sticky bottom-20">
                <ChatInput
                    onSubmit={async (input) => {
                        return sendMessage(input.content);
                    }}
                    disabled={chatInputDisabled}
                />
            </div>
        </>
    );
}
