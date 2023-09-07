'use client';
import { useLocalMedia } from '@whereby.com/browser-sdk';
import { createContext } from 'react';

export type LocalMediaRef = ReturnType<typeof useLocalMedia>;

export interface LocalMediaContext extends LocalMediaRef {
    state: LocalMediaRef['state'] & {
        isVideoEnabled: boolean;
        isAudioEnabled: boolean;
    }
}

/** This stores the context for any local media */
export const LocalMediaContext = createContext<LocalMediaContext | null>(null);