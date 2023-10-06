'use client';
import { useExternalRoomId } from '@/hooks/useRoom';
import { PermissionState } from '@/state/slices/room';
import { useAppSelector } from '@/state/store';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
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
    const hasRequested = useAppSelector((state) => state.room.permission === PermissionState.REQUESTED);
    const externalRoomId = useExternalRoomId();

    // only show connection when really in the room
    // otherwise it can still activate the camera when for example in the evaluation screen
    const pathname = usePathname();
    const isInRoom = pathname?.includes('/room');

    return isInRoom && externalRoomId && hasRequested ? (
        <LoadingValueContext.Provider value={children as JSX.Element}>
            <DynamicRoomConnectionProvider>
                {children}
            </DynamicRoomConnectionProvider>
        </LoadingValueContext.Provider>
    ) : (
        children
    );
}
