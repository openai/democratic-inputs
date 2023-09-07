import { useLocalMedia as useBaseLocalMedia } from '@whereby.com/browser-sdk';
import { PropsWithChildren, createContext, useCallback, useContext, useMemo, useState } from 'react';

export type LocalMediaRef = ReturnType<typeof useBaseLocalMedia>;

export interface LocalMediaContext extends LocalMediaRef {
    state: LocalMediaRef['state'] & {
        isVideoEnabled: boolean;
        isAudioEnabled: boolean;
    }
}

/** This stores the context for any local media */
export const LocalMediaContext = createContext<LocalMediaContext | null>(null);

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
    }, []);

    const toggleMicrophoneEnabled = useCallback((...args: Parameters<LocalMediaContext['actions']['toggleMicrophoneEnabled']>) => {
        setActionNo((n) => n + 1);
        actions.toggleMicrophoneEnabled(...args);
    }, []);

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
    }), [actions, state, toggleCameraEnabled, toggleMicrophoneEnabled]);

    return (
        <LocalMediaContext.Provider value={context}>
            {children}
        </LocalMediaContext.Provider>
    );
}

/**
 * Retrieve the state for the current local media
 */
export function useLocalMedia() {
    const ctx = useContext(LocalMediaContext);

    // GUARD: Check that the context provider is somewhere in the tree
    if (!ctx) {
        throw new Error('LocalMediaContextProvider not found. Make sure you add a <LocalMediaProvider /> in the tree when using the useLocalMedia hook.');
    }

    return ctx;
}