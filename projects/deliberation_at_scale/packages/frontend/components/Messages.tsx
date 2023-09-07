"use client";
import { isEmpty } from "radash";
import { useCallback, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";

import useMessages from "@/hooks/useMessages";
import { supabase } from "@/utilities/supabase";

export default function Messages() {
    const { messages } = useMessages();
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasMessages = !isEmpty(messages);
    const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    }, []);
    const sendMessage = async () => {
        const formattedMessage = message.trim();

        // guard: skip when already sending
        if (isSending) {
            return;
        }

        // guard: check if the message is valid
        if (isEmpty(formattedMessage)) {
            return;
        }

        // send the message and clear the form
        setIsSending(true);
        try {
            const result = await supabase.from("messages").insert({
                content: formattedMessage,
            });
            const hasError = !!result.error;

            if (hasError) {
                throw new Error(result.error.message);
            }

            setMessage("");
        } catch (error) {
            // TODO: handle errors
        }

        setIsSending(false);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    return (
        <div className="w-full p-5 max-w-4xl">
            <div className="w-full h-[calc(50dvh-160px)] md:h-[calc(100dvh-160px)] overflow-y-scroll overflow-x-hidden animate-in flex flex-col opacity-0 px-3 pt-6 text-foreground rounded-lg border mx-auto">
                {!hasMessages && <h2 className="m-auto">No messages</h2>}
                {messages.map((message) => {
                    const { id, content, created_at, type } = message;
                    const createdAt = dayjs(created_at);
                    const isToday = dayjs().isSame(createdAt, "day");
                    const formatTemplate = isToday ? "HH:mm:ss" : "MMM DD, HH:mm:ss";
                    const formattedCreatedAt = createdAt.format(formatTemplate);
                    const typeClassName = type === "bot" ? "bg-gray-400/20" : "";

                    return (
                        <div
                            key={id}
                            className={`border rounded px-4 pt-2 pb-3 mb-6 ${typeClassName}`}
                        >
                            <small className="opacity-50">
                                {formattedCreatedAt} - {type}
                            </small>
                            <p>{content}</p>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} className="h-0" />
            </div>
            <div className="w-full h-[40px] rounded-lg border m-auto mt-4 overflow-hidden">
                <form
                    className="flex"
                    onSubmit={(event) => {
                        event.preventDefault();
                        sendMessage();
                    }}
                >
                    <input
                        className="w-full h-[38px] px-4 bg-inherit text-foreground mb-6 rounded-l-lg"
                        name="message"
                        placeholder="Write down what you think..."
                        required
                        value={message}
                        onChange={(event) => {
                            setMessage(event.target.value);
                        }}
                    />
                    <button
                        className="h-full py-2 px-4 no-underline bg-btn-background hover:bg-btn-background-hover text-foreground"
                        onClick={(event) => {
                            event.preventDefault();
                            sendMessage();
                        }}
                    >
            Send
                    </button>
                </form>
            </div>
        </div>
    );
}
