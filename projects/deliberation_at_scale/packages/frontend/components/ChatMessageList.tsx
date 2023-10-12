"use client";
import { motion, AnimatePresence } from 'framer-motion';

import { Message } from '@/types/flows';
import ChatMessage from './ChatMessage';
import { MESSAGES_SCROLL_CONTAINER_ID } from '@/utilities/constants';
import classNames from 'classnames';

interface Props {
    messages: (Message | null | undefined)[] | undefined;
    className?: string;
}

export default function ChatMessageList(props: Props) {
    const { messages, className } = props;
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

    // <div className="min-h-[12px] md:min-h-[50px] w-full top-0 bg-gradient-to-t from-transparent to-white"></div>
    return (
        <motion.div
            id={MESSAGES_SCROLL_CONTAINER_ID}
            className={classNames(
                "flex flex-col gap-1 overflow-y-scroll min-h-0 shrink",
                className
            )}
            variants={variants}
            initial="hidden"
            animate="visible"
        >
            <AnimatePresence>
                {messages.map((message, index) => {
                    const { id = index, date, nameId } = message ?? {};
                    const key = `${id}-${date}`;
                    const previousMessage = messages?.[index - 1];
                    const nextMessage = messages?.[index + 1];
                    const nameKey = nameId ? 'nameId' : 'name';

                    // guard: check if message is valid
                    if (!message) {
                        return null;
                    }

                    const isFirst = previousMessage?.[nameKey] !== message?.[nameKey];
                    const isLast = nextMessage?.[nameKey] !== message?.[nameKey];

                    return (
                        <ChatMessage
                            className={index === 0 ? 'mt-auto' : ''}
                            key={key}
                            message={message}
                            first={isFirst}
                            last={isLast}
                        />
                    );
                })}
            </AnimatePresence>

        </motion.div>
    );
}
