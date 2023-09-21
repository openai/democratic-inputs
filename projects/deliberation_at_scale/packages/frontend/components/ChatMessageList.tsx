"use client";
import { motion, AnimatePresence } from 'framer-motion';

import { Message } from '@/flows/types';
import ChatMessage from './ChatMessage';

interface Props {
    messages: Message[] | undefined;
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
            className="flex flex-col gap-2"
            variants={variants}
            initial="hidden"
            animate="visible"
        >
            <AnimatePresence>
                {messages.map((message, index) => {
                    const { id = index, date } = message;
                    const key = `${id}-${date}`;

                    return (
                        <ChatMessage key={key} {...message} />
                    );
                })}
            </AnimatePresence>
        </motion.div>
    );
}