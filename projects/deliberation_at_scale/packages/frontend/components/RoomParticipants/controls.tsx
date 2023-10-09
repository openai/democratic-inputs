'use client';

import { useLeaveRoomMutation } from '@/generated/graphql';
import { useLocalMedia } from '@/hooks/useLocalMedia';
import useRoom from '@/hooks/useRoom';
import useTheme, { ThemeColors } from '@/hooks/useTheme';
import { faMicrophoneAlt, faMicrophoneAltSlash, faVideo, faVideoSlash, faDoorOpen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLingui } from '@lingui/react';
import classNames from 'classnames';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MouseEvent, useCallback } from 'react';
import { msg } from "@lingui/macro";

const bgColorMap: Record<ThemeColors, string> = {
    'blue': 'text-blue-400 bg-blue-800/50',
    'green': 'text-green-400 bg-green-800/50',
    'orange': 'text-orange-400 bg-orange-800/50',
};

export default function LocalParticipantControls() {
    const { actions, state } = useLocalMedia();
    const theme = useTheme();
    const { _ } = useLingui();

    const { push } = useRouter();
    const { participantId, roomId } = useRoom();
    const [leaveRoom] = useLeaveRoomMutation({ variables: { participantId }});

    const handleToggleMicrophone = useCallback((e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        actions.toggleMicrophoneEnabled();
    }, [actions]);

    const handleToggleCamera = useCallback((e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        actions.toggleCameraEnabled();
    }, [actions]);

    const handleLeaveRoomClick = useCallback(async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        await leaveRoom();
        push(`/evaluate/${roomId}`);
    }, [leaveRoom, push, roomId]);

    return (
        <motion.div
            className="absolute top-0 bottom-0 left-0 flex flex-col justify-center gap-2 text-xl pr-2"
            initial={{ opacity: 0, scale: 0.7, x: '-75%' }}
            animate={{ opacity: 1, scale: 1, x: '-100%' }}
            exit={{ opacity: 0, scale: 0.7, x: '-75%' }}
            transition={{ duration: 0.1, bounce: 1 }}
        >
            <button
                className={classNames(
                    "w-8 md:w-12 rounded-lg aspect-square flex justify-center items-center backdrop-blur-lg border-none bg-gray-600/50",
                    state.isAudioEnabled
                        ? bgColorMap[theme]
                        : 'text-gray-200 bg-gray-600/50',
                )}
                title={state.isAudioEnabled ? _(msg`Disable audio`) : _(msg`Enable audio`)}
                onClick={handleToggleMicrophone}
            >
                <FontAwesomeIcon
                    icon={state.isAudioEnabled ? faMicrophoneAlt : faMicrophoneAltSlash}
                    fixedWidth
                />
            </button>
            <button
                className={classNames(
                    "w-8 md:w-12 rounded-lg aspect-square flex justify-center items-center backdrop-blur-lg border-none",
                    state.isVideoEnabled
                        ? bgColorMap[theme]
                        : 'text-gray-200 bg-gray-600/50',
                )}
                title={state.isVideoEnabled ? _(msg`Disable video`) : _(msg`Enable video`)}
                onClick={handleToggleCamera}
            >
                <FontAwesomeIcon
                    icon={state.isVideoEnabled ? faVideo : faVideoSlash}
                    fixedWidth
                />
            </button>
            <button
                className={classNames(
                    "w-8 md:w-12 rounded-lg aspect-square flex justify-center items-center backdrop-blur-lg border-none bg-gray-200/50 text-red-600",
                )}
                title={_(msg`Leave conversation`)}
                onClick={handleLeaveRoomClick}
            >
                <FontAwesomeIcon
                    icon={faDoorOpen}
                    fixedWidth
                />
            </button>
        </motion.div>
    );
}
