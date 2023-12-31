'use client';
import { useRoomConnection } from '@/components/RoomConnection/context';
import { useLocalMedia } from '@/hooks/useLocalMedia';
import { faVideoSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import LocalParticipantControls from './controls';
import { SHOW_VIDEO_CONTROLS_INITIALLY } from '@/utilities/constants';

export interface ParticipantsProps {
    variant: 'compact' | 'spacious';
}

export default function RoomParticipants({ variant }: ParticipantsProps) {
    const [showLocalControls, setShowLocalControls] = useState(SHOW_VIDEO_CONTROLS_INITIALLY);
    const connection = useRoomConnection();
    const { state } = useLocalMedia();
    const { remoteParticipants } = connection?.state ?? {};
    const { VideoView } = connection?.components ?? {};
    const defaultFadeInVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };
    const handleLocalParticipantClick = useCallback(() => {
        setShowLocalControls((current) => !current);
    }, [setShowLocalControls]);

    if (!connection || !VideoView) {
        return null;
    }

    return (
        <motion.div
            className={classNames("relative z-20", variant === 'compact' && "max-h-[30vh]")}
        >
            <div
                className={classNames(
                    "flex",
                    variant === 'compact' && 'h-[20vh] md:h-[30vh] bg-gray-100 overflow-hidden border md:mx-4 gap-1 md:mx-1',
                    variant === 'spacious' && 'h-[40vh] relative',
                )}
            >
                {remoteParticipants?.map((participant, i) => {
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
                                    className="w-full h-full object-cover rounded"
                                    stream={participant.stream}
                                    disablePictureInPicture
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center border">
                                    <FontAwesomeIcon icon={faVideoSlash} />
                                </div>
                            )}
                            {/* <div
                                className={classNames(
                                    `absolute bottom-2 backdrop-blur-lg p-2 flex justify-center rounded gap-4 bg-gray-800/90 text-white z-20`,
                                    variant === 'spacious' && 'left-2',
                                    i === 0 && variant === 'compact' && 'left-2',
                                    i > 0 && variant === 'compact' && 'right-2',
                                )}
                            >
                                <span>{participant.displayName || 'Guest'}</span>
                            </div> */}
                        </motion.div>
                    );
                })}
            </div>
            <motion.div
                className={classNames(
                    "flex justify-center gap-2 absolute w-1/5 bottom-0 z-20",
                    variant === 'compact' && 'aspect-square right-2 mb-[-12px]',
                    variant === 'spacious' && 'aspect-square right-2',
                )}
                variants={defaultFadeInVariants}
                initial="hidden"
                animate="visible"
            >
                <button className="grow" onClick={handleLocalParticipantClick}>
                    {(state.localStream && state.isVideoEnabled) ? (
                        <VideoView
                            muted={true}
                            className="w-full h-full object-cover border-4 rounded-full hover:scale-105 shadow"
                            stream={state.localStream}
                            disablePictureInPicture
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
