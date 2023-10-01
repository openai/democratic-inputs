'use client';
import { useRoomConnection } from '@/components/RoomConnection/context';
import { useLocalMedia } from '@/hooks/useLocalMedia';
import { faVideoSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import LocalParticipantControls from './controls';

export interface ParticipantsProps {
    variant: 'compact' | 'spacious';
}

export default function RoomParticipants({ variant }: ParticipantsProps) {
    const [showLocalControls, setShowLocalControls] = useState(false);
    const connection = useRoomConnection();
    const { state } = useLocalMedia();

    const handleLocalParticipantClick = useCallback(() => {
        setShowLocalControls((current) => !current);
    }, []);


    if (!connection) {
        return null;
    }

    const { remoteParticipants } = connection.state;
    const { VideoView } = connection.components;
    const defaultFadeInVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    return (
        <motion.div
            className="max-h-[40vh] relative z-20"
        >
            <div
                className={classNames(
                    "flex",
                    variant === 'compact' && 'aspect-[16/9] bg-gray-100 rounded overflow-hidden border',
                    variant === 'spacious' && 'h-[40vh] relative',
                )}
            >
                {remoteParticipants.map((participant, i) => {
                    if (!participant) {
                        return null;
                    }

                    return (
                        <motion.div
                            key={participant.id}
                            className={classNames(
                                'flex-grow flex-shrink min-w-0',
                                variant === 'compact' && 'relative',
                                variant === 'spacious' && 'aspect-square rounded overflow-hidden bg-gray-100 w-[52%] absolute border',
                                i === 0 && variant === 'spacious' && 'right-0 top-0 z-10',
                                i === 1 && variant === 'spacious' && 'left-0 bottom-0',
                            )}
                            variants={defaultFadeInVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {(participant.stream && participant.isVideoEnabled) ? (
                                <VideoView
                                    className="w-full h-full object-cover"
                                    stream={participant.stream}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center border">
                                    <FontAwesomeIcon icon={faVideoSlash} />
                                </div>
                            )}
                            <div
                                className={classNames(
                                    `absolute bottom-2 backdrop-blur-lg p-2 flex justify-center rounded gap-4 bg-gray-800/90 text-white z-20`,
                                    variant === 'spacious' && 'left-2',
                                    i === 0 && variant === 'compact' && 'left-2',
                                    i > 0 && variant === 'compact' && 'right-2',
                                )}
                            >
                                <span>{participant.displayName || 'Guest'}</span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
            <motion.div
                className={classNames(
                    "flex justify-center gap-2 absolute w-1/5 bottom-0 bg-gray-100 z-20",
                    variant === 'compact' && 'aspect-[3/4] left-1/2 translate-x-[-50%] mb-[-12px]',
                    variant === 'spacious' && 'aspect-square right-2',
                )}
                variants={defaultFadeInVariants}
                initial="hidden"
                animate="visible"
            >
                <button onClick={handleLocalParticipantClick}>
                    {(state.localStream && state.isVideoEnabled) ? (
                        <VideoView
                            className="w-full h-full object-cover rounded border"
                            stream={state.localStream}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center border rounded text-gray-300">
                            <FontAwesomeIcon icon={faVideoSlash} />
                        </div>
                    )}
                </button>
                <AnimatePresence>
                    {showLocalControls && (
                        <LocalParticipantControls />
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}
