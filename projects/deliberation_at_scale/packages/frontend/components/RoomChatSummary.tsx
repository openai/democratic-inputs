'use client';
import { AnimatePresence, motion } from 'framer-motion';

import useTintedThemeColor from "@/hooks/useTintedThemeColor";
import { topicSolid } from "./EntityIcons";
import Pill from "./Pill";
import useRoom from "@/hooks/useRoom";
import { useSendRoomMessageMutation } from '@/generated/graphql';
import ChatInput from './ChatInput';
import { isEmpty } from 'radash';

const ENABLE_CHAT = false;

export default function RoomChatSummary() {
    const { topic, lastBotMessages, lastParticipantMessages, participantId, roomId } = useRoom();
    const { content: topicContent } = topic ?? {};
    const topicColorBg = useTintedThemeColor({ classNamePrefix: 'bg', tint: 400 });
    const [sendRoomMessage] = useSendRoomMessageMutation();

    return (
        <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {topicContent && (
                <div className={`p-4 rounded gap-4 flex items-center ${topicColorBg}`}>
                    <Pill icon={topicSolid} className="border-green-700">Topic</Pill>
                    {topicContent}
                </div>
            )}
            {!isEmpty(lastBotMessages) && (
                <div className="flex flex-col gap-2">
                    <AnimatePresence mode="wait" initial={false}>
                        {lastBotMessages.map((message) => {
                            const { id, content, name, nameIcon } = message;

                            return (
                                <motion.div
                                    key={id}
                                    layoutId={id}
                                >
                                    <Pill icon={nameIcon} className="mb-4">{name}</Pill>
                                    <p>{content}</p>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
            {!isEmpty(lastParticipantMessages) && !isEmpty(lastBotMessages) && (
                <motion.hr layout />
            )}
            {!isEmpty(lastParticipantMessages) && (
                <div className="flex flex-col gap-2">
                    <AnimatePresence mode="wait" initial={false}>
                        {lastParticipantMessages.map((message) => {
                            const { id, content, name } = message;

                            return (
                                <motion.div
                                    key={id}
                                    layoutId={id}
                                    initial={{ opacity: 0, x: 300 }}
                                    animate={{ opacity: 1, x: 0, transition: { duration: 0.3 } }}
                                    exit={{ opacity: 0, x: -100, transition: { duration: 0.15 } }}
                                >
                                    <strong>{name}</strong>
                                    <p>{content}</p>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
            {ENABLE_CHAT && (
                <ChatInput
                    onSubmit={async (input) => {
                        sendRoomMessage({
                            variables: {
                                content: input.content,
                                roomId,
                                participantId,
                            }
                        });
                        return true;
                    }}
                />
            )}
        </motion.div>
    );
}


