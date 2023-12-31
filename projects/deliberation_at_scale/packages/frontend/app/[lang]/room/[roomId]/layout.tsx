'use client';
import { PropsWithChildren, useEffect, useMemo } from 'react';

// import RoomMenu from '@/components/RoomMenu';
import { useLocalMedia } from '@/hooks/useLocalMedia';
import { useRoomConnection } from '@/components/RoomConnection/context';
import Loader from '@/components/Loader';
import useRoom from '@/hooks/useRoom';
import RoomTranscription from '@/components/RoomTranscription';
import { ENABLE_WHEREBY, ROOM_JOINING_EXPIRY_TIME_MS } from '@/utilities/constants';
import { useDispatch } from 'react-redux';
import { resetFlowStates } from '@/state/slices/flow';
import { isEmpty } from 'radash';
import { msg } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import useLocalizedPush from '@/hooks/useLocalizedPush';

/**
 * This is the layout for all room interfaces, i.e. all interfaces in which a
 * participant is discussing with other participants.
 */
export default function RoomLayout({ children }: PropsWithChildren) {
    const localMedia = useLocalMedia();
    const connection = useRoomConnection();
    const { push } = useLocalizedPush();
    const { room, roomId, loadingRooms, joiningParticipants, inactiveParticipants, loadingParticipants } = useRoom();
    const hasInactiveParticipants = inactiveParticipants?.length > 0;
    const dispatch = useDispatch();
    const { _ } = useLingui();

    // Determine whether everything is ready to display the room
    const notReadyMessage = useMemo(() => {
        if (!roomId) {
            return _(msg`Finding room...`);
        }

        if (!room || loadingRooms) {
            return  _(msg`Loading room...`);
        }

        if (!localMedia || !localMedia.state?.localStream) {
            return  _(msg`Loading media...`);
        }

        if (ENABLE_WHEREBY && (!connection || connection.state?.roomConnectionStatus === 'connecting')) {
            return  _(msg`Connecting to video call...`);
        }

        if (joiningParticipants.length > 0) {
            return  _(msg`Waiting for all participants to join...`);
        }
    }, [roomId, room, loadingRooms, localMedia, connection, joiningParticipants.length, _]);
    const isReady = isEmpty(notReadyMessage);

    // handle timeouts when going to an invalid room
    useEffect(() => {
        if (isReady) {
            return;
        }

        const redirectTimeout = setTimeout(() => {
            push('/lobby/invalid');
        }, ROOM_JOINING_EXPIRY_TIME_MS);

        return () => {
            clearTimeout(redirectTimeout);
        };
    }, [isReady, push]);

    // handle inactive rooms or inactive participants
    useEffect(() => {
        if ((!room && !loadingRooms) || (hasInactiveParticipants && !loadingParticipants)) {
            push('/lobby/invalid');
        }
    }, [loadingRooms, push, room, hasInactiveParticipants, loadingParticipants]);

    // once in the room reset all the flow states
    // this is so that any previous flow state is not carried over to new rooms
    useEffect(() => {
        if (!isReady) {
            return;
        }

        dispatch(resetFlowStates());
    }, [dispatch, isReady, localMedia]);

    // GUARD: Display loader when everything is not ready yet
    if (!isReady) {
        return (
            <Loader title={notReadyMessage} />
        );
    }

    return (
        <div className="flex max-h-screen h-full w-full flex-col">
            <div className="flex-grow flex-shrink min-h-0">
                {children}
            </div>
            <RoomTranscription />
            {/* <RoomMenu /> */}
        </div>
    );
}
