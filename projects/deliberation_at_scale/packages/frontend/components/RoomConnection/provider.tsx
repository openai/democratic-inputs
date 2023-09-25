'use client';
import { PropsWithChildren, useMemo } from 'react';

import { RoomConnectionContext } from './context';
import { useRoomConnection } from '@whereby.com/browser-sdk';
import { useLocalMedia } from '@/hooks/useLocalMedia';
import useRoom from '@/hooks/useRoom';

/**
 * This provider will instantiate the Whereby `useLocalMedia` hook and make its
 * output available via the RoomConnection context.
 */
export default function RoomConnectionProvider({ children }: PropsWithChildren) {
    const { externalRoomId } = useRoom();

    // Construct the room URL
    const roomUrl = useMemo(() => {
        //return `https://${NEXT_PUBLIC_WHEREBY_SUBDOMAIN}/${externalRoomId}`;
        return externalRoomId ?? '';
    }, [externalRoomId]);

    // Retrieve the local media data, which should already be initialized.
    const localMedia = useLocalMedia();

    // Then, start the room connection
    const connection = useRoomConnection(roomUrl, { localMedia, localMediaConstraints: { audio: true, video: true }, logger: console });

    return (
        <RoomConnectionContext.Provider value={connection}>
            {children}
        </RoomConnectionContext.Provider>
    );
}
