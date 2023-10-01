'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { isEmpty } from 'radash';
import { Trans } from '@lingui/macro';

import useTheme, { ThemeColors } from "@/hooks/useTheme";
import { topicSolid } from "./EntityIcons";
import Pill from "./Pill";
import useRoom from "@/hooks/useRoom";
import { useSendRoomMessageMutation } from '@/generated/graphql';
import ChatInput from './ChatInput';
import RoomOutcome from './RoomOutcome';
import ReactMarkdown from 'react-markdown';
import { MESSAGES_SCROLL_CONTAINER_ID } from '@/utilities/constants';
import { useEffect } from 'react';
import { useAppDispatch } from '@/state/store';
import { openRoomAssistant } from '@/state/slices/room';
import useRoomActions from '@/hooks/useRoomActions';
import ChatActions from './ChatActions';

const ENABLE_CHAT = false;

const topicColorBgMap: Record<ThemeColors, string> = {
    'blue': 'bg-blue-400',
    'green': 'bg-green-400',
    'orange': 'bg-orange-400',
};
const messageAnimation = {
    initial: { opacity: 0, x: 300 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -100, transition: { duration: 0.15 } },
};

export default function RoomChatSummary() {
    const { topic, lastBotMessages, lastParticipantMessages, participantId, roomId, outcomes } = useRoom();
    const { content: topicContent } = topic ?? {};
    const { actions } = useRoomActions();
    const theme = useTheme();
    const [sendRoomMessage] = useSendRoomMessageMutation();
    const dispatch = useAppDispatch();

    // keep track of when this component was shown for the last time
    useEffect(() => {
        dispatch(openRoomAssistant());
    }, [dispatch]);

    return (
        <div className="flex flex-col gap-2 py-4 justify-between h-full">
            <motion.div
                id={MESSAGES_SCROLL_CONTAINER_ID}
                className="flex flex-col gap-4 overflow-y-scroll"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {topicContent && (
                    <div className={`p-4 rounded gap-4 flex items-center ${topicColorBgMap[theme]}`}>
                        <Pill icon={topicSolid} className="border-green-700"><Trans>Topic</Trans></Pill>
                        <ReactMarkdown>{topicContent}</ReactMarkdown>
                    </div>
                )}
                <AnimatePresence>
                    {outcomes?.map((outcome) => {
                        const { id: outcomeId } = outcome;

                        return (
                            <RoomOutcome key={outcomeId} outcome={outcome} participantId={participantId} />
                        );
                    })}
                </AnimatePresence>
                <div className="flex flex-col gap-2">
                    <AnimatePresence mode="wait" initial={false}>
                        {lastBotMessages.map((message) => {
                            const { id, content, name, nameIcon } = message;
                            const formattedContent = content?.trim();

                            return (
                                <motion.div
                                    key={id}
                                    layoutId={id}
                                    {...messageAnimation}
                                >
                                    <Pill icon={nameIcon} className="mb-4">{name}</Pill>
                                    <ReactMarkdown>{formattedContent}</ReactMarkdown>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
                {!isEmpty(lastParticipantMessages) && !isEmpty(lastBotMessages) && (
                    <motion.hr layout />
                )}
                <div className="flex flex-col gap-2">
                    <AnimatePresence mode="wait" initial={false}>
                        {lastParticipantMessages.map((message) => {
                            const { id, content, name } = message;
                            const formattedContent = content?.trim();

                            return (
                                <motion.div
                                    key={id}
                                    layoutId={id}
                                    {...messageAnimation}
                                >
                                    <strong>{name}</strong>
                                    <ReactMarkdown>{formattedContent}</ReactMarkdown>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </motion.div>
            <div className="flex flex-col gap-4">
                <ChatActions actions={actions} />
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
            </div>
        </div>
    );
}


