'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { isEmpty } from 'radash';

import RoomTopic from './RoomTopic';
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
import Divider from './Divider';
import { usePingParticipant } from '@/hooks/usePingParticipant';

const ENABLE_CHAT = false;
const messageAnimation = {
    initial: { opacity: 0, x: 300 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -100, transition: { duration: 0.15 } },
};

export default function RoomChatSummary() {
    const { lastBotMessages, lastParticipantMessages, participantId, participant, participants, roomId, outcomes } = useRoom();
    const { actions } = useRoomActions();
    const [sendRoomMessage] = useSendRoomMessageMutation();
    const dispatch = useAppDispatch();

    // keep track of when this component was shown for the last time
    useEffect(() => {
        dispatch(openRoomAssistant());
    }, [dispatch]);

    // ping the participant entry to know which participants are still in the room
    usePingParticipant(participant);

    return (
        <div className="flex flex-col gap-2 pb-4 justify-between min-h-0">
            <RoomTopic />
            <motion.div
                id={MESSAGES_SCROLL_CONTAINER_ID}
                className="flex flex-col gap-4 overflow-y-scroll"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <AnimatePresence>
                    {outcomes?.map((outcome) => {
                        const { id: outcomeId } = outcome;

                        return (
                            <RoomOutcome
                                key={outcomeId}
                                outcome={outcome}
                                participantId={participantId}
                                participants={participants}
                            />
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
                    <Divider />
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
                {!isEmpty(actions) && (
                    <Divider />
                )}
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


