'use client';
import { useGetRoomsQuery } from '@/generated/graphql';
import { useAppSelector } from '@/state/store';
import dynamic from 'next/dynamic';
import { PropsWithChildren, createContext, useContext } from 'react';

// FFS: https://github.com/vercel/next.js/issues/7906
// We need to create a context to keep the children mounted while the dynamic
// component mounts. If we don't the children get dismounted, and re-mounted,
// effects get triggered and everything gets progressively worse.
const LoadingValueContext = createContext<JSX.Element | null>(null);

// A simple loader retrieves the children and shows those
function Loader() {
    const children = useContext(LoadingValueContext);
    return children || null;
}

const DynamicRoomConnectionProvider = dynamic(
    () => import('./provider'),
    { ssr: false, loading: Loader }
);

/**
 * This will conditionally inject the `RoomConnectionProvider` in the
 * application tree based on whether a `roomId` has been set in Redux.
 */
export default function ConditionalRoomConnectionProvider({ children }: PropsWithChildren) {
    const roomId = useAppSelector((state) => state.room.currentRoomId);
    const { data: roomData } = useGetRoomsQuery({
        variables: {
            roomId,
        },
    });
    const room = roomData?.roomsCollection?.edges?.[0];
    const externalRoomId = room?.node.external_room_id;

    return externalRoomId ? (
        <LoadingValueContext.Provider value={children as JSX.Element}>
            <DynamicRoomConnectionProvider>
                {children}
            </DynamicRoomConnectionProvider>
        </LoadingValueContext.Provider>
    ) : (
        children
    );
}
