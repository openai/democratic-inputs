'use client';
import { PropsWithChildren, useMemo } from 'react';

import { RoomConnectionContext } from './context';
import { useRoomConnection } from '@whereby.com/browser-sdk';
import { useAppSelector } from '@/state/store';
import { useLocalMedia } from '@/hooks/useLocalMedia';
import { NEXT_PUBLIC_WHEREBY_SUBDOMAIN } from '@/utilities/constants';
import { useGetRoomsQuery } from '@/generated/graphql';

const DEFAULT_TEST_EXTERNAL_ROOM_ID = '';

/**
 * This provider will instantiate the Whereby `useLocalMedia` hook and make its
 * output available via the RoomConnection context.
 */
export default function RoomConnectionProvider({ children }: PropsWithChildren) {
    // Extract the room id from Redux
    const roomId = useAppSelector((state) => state.room.currentRoomId);
    const { data: roomData } = useGetRoomsQuery({
        variables: {
            roomId,
        },
    });
    const room = roomData?.roomsCollection?.edges?.[0];
    const externalRoomId = room?.node.external_room_id ?? DEFAULT_TEST_EXTERNAL_ROOM_ID;

    // Construct the room URL
    const roomUrl = useMemo(() => (
        `https://${NEXT_PUBLIC_WHEREBY_SUBDOMAIN}/${externalRoomId}`
    ), [externalRoomId]);

    // Retrieve the local media data, which should already be initialized.
    const localMedia = useLocalMedia();

    // TMP: remove null connection when Whereby login is shared in 1password
    // Then, start the room connection
    // const connection = useRoomConnection(roomUrl, { localMedia });
    const connection = null;

    return (
        <RoomConnectionContext.Provider value={connection}>
            {children}
        </RoomConnectionContext.Provider>
    );
}
