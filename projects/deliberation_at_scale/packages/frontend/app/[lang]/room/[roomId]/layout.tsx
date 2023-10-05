'use client';
import { PropsWithChildren, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import RoomMenu from '@/components/RoomMenu';
import { useLocalMedia } from '@/hooks/useLocalMedia';
import { useRoomConnection } from '@/components/RoomConnection/context';
import Loader from '@/components/Loader';
import useRoom from '@/hooks/useRoom';
import RoomTranscription from '@/components/RoomTranscription';
import { ENABLE_WHEREBY, ROOM_JOINING_EXPIRY_TIME_MS } from '@/utilities/constants';
import { useDispatch } from 'react-redux';
import { resetFlowStates } from '@/state/slices/flow';

/**
 * This is the layout for all room interfaces, i.e. all interfaces in which a
 * participant is discussing with other participants.
 */
export default function RoomLayout({ children }: PropsWithChildren) {
    const localMedia = useLocalMedia();
    const connection = useRoomConnection();
    const { push } = useRouter();
    const { room, roomId, loadingRooms } = useRoom();
    const dispatch = useDispatch();

    // Determine whether everything is ready to display the room
    const isReady = useMemo(() => {
        return roomId
            && room
            && !loadingRooms
            && localMedia
            && localMedia.state?.localStream
            && (!ENABLE_WHEREBY || connection)
            && (!ENABLE_WHEREBY || connection?.state?.roomConnectionStatus !== 'connecting');
    }, [roomId, localMedia, connection, room, loadingRooms]);

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
        return <Loader />;
    }

    return (
        <div className="flex max-h-screen h-full w-full flex-col">
            <div className="flex-grow flex-shrink min-h-0">
                {children}
            </div>
            <RoomTranscription />
            <RoomMenu />
        </div>
    );
}
