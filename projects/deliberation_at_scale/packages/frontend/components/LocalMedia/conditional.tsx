'use client';
import { PermissionState } from '@/state/slices/room';
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

const DynamicLocalMediaProvider = dynamic(
    () => import('./provider'),
    { ssr: false, loading: Loader },
);

/**
 * A provider that will conditionally mount `LocalMediaProvider` in the
 * application tree based on whether permissions have been requested through
 * setting `permission` in the Redux store.
 */
export default function ConditionalLocalMediaProvider({ children }: PropsWithChildren) {
    const permission = useAppSelector((state) => state.room.permission);

    if (permission === PermissionState.REQUESTED) {
        return (
            <LoadingValueContext.Provider value={children as JSX.Element}>
                <DynamicLocalMediaProvider>
                    {children}
                </DynamicLocalMediaProvider>
            </LoadingValueContext.Provider>
        );
    } else if (permission === PermissionState.NONE) {
        return children;
    } else {
        return null;
    }
}
