import { useLocalMedia as useBaseLocalMedia } from '@whereby.com/browser-sdk';
import { PermissionState } from '@/state/slices/room';
import { useAppSelector } from '@/state/store';
import { PropsWithChildren, useState, useCallback, useMemo } from 'react';
import { LocalMediaContext } from './context';

/**
 * This initializes Local Media for the Whereby SDK and adds some convenience
 * functions for later use.
 */
export function LocalMediaProvider({ children }: PropsWithChildren) {
    // Run the base hook from the Whereby SDK
    const { actions, state, ...rest } = useBaseLocalMedia();

    // Keep some arbitrary state that we can change so that we can force a re-render
    const [, setActionNo] = useState(0);

    // Check whether both the audio and video are currently enabled. Since the
    // SDK switches this directly using the mediaDevices API, we have no way of
    // detecting when this changes. Hence, we use the above state to force state
    // updates so that is connected.
    const isAudioEnabled = state.localStream?.getAudioTracks().some((t) => t.enabled) || false;
    const isVideoEnabled = state.localStream?.getVideoTracks().some((t) => t.enabled) || false;
    
    const toggleCameraEnabled = useCallback((...args: Parameters<LocalMediaContext['actions']['toggleCameraEnabled']>) => {
        setActionNo((n) => n + 1);
        actions.toggleCameraEnabled(...args);
    }, [actions]);

    const toggleMicrophoneEnabled = useCallback((...args: Parameters<LocalMediaContext['actions']['toggleMicrophoneEnabled']>) => {
        setActionNo((n) => n + 1);
        actions.toggleMicrophoneEnabled(...args);
    }, [actions]);

    const context: LocalMediaContext = useMemo(() => ({
        actions: {
            ...actions,
            toggleCameraEnabled,
            toggleMicrophoneEnabled,
        },
        state: {
            ...state,
            isAudioEnabled,
            isVideoEnabled,
        },
        ...rest,
    }), [actions, state, toggleCameraEnabled, toggleMicrophoneEnabled, rest, isAudioEnabled, isVideoEnabled]);

    return (
        <LocalMediaContext.Provider value={context}>
            {children}
        </LocalMediaContext.Provider>
    );
}

/**
 * This Provider conditionally loads the LocalMediaProvider so that it's only
 * triggered when a flag is explicitly set to trigger permission requests to the user.
 */
export function ConditionalLocalMediaProvider({ children }: PropsWithChildren) {
    const permission = useAppSelector((state) => state.room.permission);

    if (permission === PermissionState.REQUESTED) {
        return (
            <LocalMediaProvider>{children}</LocalMediaProvider>
        );
    } else if (permission === PermissionState.NONE) {
        return children;
    } else {
        return null;
    }
}
