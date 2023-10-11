"use client";
import { motion, AnimatePresence } from 'framer-motion';

import { Message } from '@/types/flows';
import ChatMessage from './ChatMessage';
import { MESSAGES_SCROLL_CONTAINER_ID } from '@/utilities/constants';
import classNames from 'classnames';
import { useState, useEffect, useRef } from 'react';

interface Props {
    messages: (Message | null | undefined)[] | undefined;
    className?: string;
}

export default function ChatMessageList(props: Props) {
    const { messages, className } = props;
    // state to control visibility of gradient shadows 
    const [topShadow, setTopShadow] = useState(0);
    const [bottomShadow, setBottomShadow] = useState(0);

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const current = ref.current;
        const handleScroll = () => {
            if (current) {
                const scrollTop = current.scrollTop;
                const offsetHeight = current.offsetHeight;
                const scrollHeight = current.scrollHeight;
                // Calculate opacity based on scroll position
                const topShadowOpacity = Math.min(scrollTop / 100, 1);
                const bottomShadowOpacity = Math.min((scrollHeight - scrollTop - offsetHeight) / 100, 1);
                // Set shadow visibility based on scroll position
                setTopShadow(topShadowOpacity);
                setBottomShadow(bottomShadowOpacity);
            }
        };
        if (current) {
            current.addEventListener("scroll", handleScroll);
        }
        return () => {
            if (current) {
                current.removeEventListener("scroll", handleScroll);
            }
        };
    }, []);


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
        <>
            <div className="min-h-[12px] md:min-h-[50px] absolute w-full top-0 bg-gradient-to-t from-transparent to-white" style={{opacity: topShadow}}></div>

            <motion.div
                id={MESSAGES_SCROLL_CONTAINER_ID}
                className={classNames(
                    "flex flex-col gap-1 overflow-y-scroll min-h-0 shrink relative",
                    className
                )}
                variants={variants}
                initial="hidden"
                animate="visible"
                ref={ref}
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
            <div className="min-h-[12px] md:min-h-[50px] absolute w-full bottom-28 md:bottom-32 bg-gradient-to-b from-transparent to-white" style={{opacity: bottomShadow}}></div>
        </>
    );
}
