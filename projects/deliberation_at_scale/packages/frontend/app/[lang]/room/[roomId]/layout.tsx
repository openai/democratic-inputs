'use client';
import { PropsWithChildren, useMemo } from 'react';

import RoomMenu from '@/components/RoomMenu';
import { useLocalMedia } from '@/hooks/useLocalMedia';
import { useRoomConnection } from '@/components/RoomConnection/context';
import Loader from '@/components/Loader';
import useRoom from '@/hooks/useRoom';
import RoomTranscription from '@/components/RoomTranscription';
import { ENABLE_WHEREBY } from '@/utilities/constants';

/**
 * This is the layout for all room interfaces, i.e. all interfaces in which a
 * participant is discussing with other participants.
 */
export default function RoomLayout({ children }: PropsWithChildren) {
    const localMedia = useLocalMedia();
    const connection = useRoomConnection();
    const { room, roomId, loadingRooms } = useRoom();

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
