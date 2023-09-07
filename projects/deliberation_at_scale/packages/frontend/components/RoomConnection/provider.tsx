'use client';
import { PropsWithChildren, useMemo } from 'react';
import { RoomConnectionContext } from './context';
import { useRoomConnection } from '@whereby.com/browser-sdk';
import { useAppSelector } from '@/state/store';
import { useLocalMedia } from '@/hooks/useLocalMedia';
import { NEXT_PUBLIC_WHEREBY_SUBDOMAIN } from '@/utilities/constants';

/**
 * This provider will instantiate the Whereby `useLocalMedia` hook and make its
 * output available via the RoomConnection context.
 */
export default function RoomConnectionProvider({ children }: PropsWithChildren) {
    // Extract the room id from Redux
    const roomId = useAppSelector((state) => state.room.currentRoomId);

    // Construct the room URL
    const roomUrl = useMemo(() => (
        `https://${NEXT_PUBLIC_WHEREBY_SUBDOMAIN}/${roomId}`
    ), [roomId]);

    // Retrieve the local media data, which should already be initialized.
    const localMedia = useLocalMedia();

    // Then, start the room connection
    const connection = useRoomConnection(roomUrl, { localMedia });

    return (
        <RoomConnectionContext.Provider value={connection}>
            {children}
        </RoomConnectionContext.Provider>
    );
}