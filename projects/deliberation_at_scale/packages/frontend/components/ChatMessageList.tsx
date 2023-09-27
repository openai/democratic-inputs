"use client";
import { motion, AnimatePresence } from 'framer-motion';

import { Message } from '@/flows/types';
import ChatMessage from './ChatMessage';
import { MAIN_SCROLL_CONTAINER_ID } from '@/utilities/constants';

interface Props {
    messages: (Message | null | undefined)[] | undefined;
}

export default function ChatMessageList(props: Props) {
    const { messages } = props;
    const variants = {
        visible: {
            transition: {
                duration: 0.1,
                when: 'beforeChildren',
                staggerChildren: 0.05,
            },
        },
        hidden: {
            transition: {
                duration: 0.1,
                when: 'afterChildren',
            },
        },
    };

    // guard: skip when messages are invalid
    if (!messages) {
        return null;
    }

    return (
        <motion.div
            className="flex flex-col gap-1 h-full overflow-y-scroll px-4"
            variants={variants}
            initial="hidden"
            animate="visible"
            id={MAIN_SCROLL_CONTAINER_ID}
        >
            <AnimatePresence>
                {messages.map((message, index) => {
                    const { id = index, date } = message ?? {};
                    const key = `${id}-${date}`;
                    const previousMessage = messages[index - 1];
                    const nextMessage = messages[index + 1];

                    // guard: check if message is valid
                    if (!message) {
                        return null;
                    }

                    return (
                        <ChatMessage
                            className={index === 0 ? 'mt-auto' : ''}
                            key={key}
                            message={message}
                            first={previousMessage?.name !== message.name}
                            last={nextMessage?.name !== message.name}
                        />
                    );
                })}
            </AnimatePresence>
        </motion.div>
    );
}
