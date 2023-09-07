'use client';
import type { useRoomConnection as baseUseRoomConnection } from '@whereby.com/browser-sdk';
import { createContext, useContext } from 'react';

// Stores all data for the `RoomConnection`
export const RoomConnectionContext = createContext<ReturnType<typeof baseUseRoomConnection> | null>(null);

/**
 * Retrieve the room connection data. Use this hook in lieu of the one that is
 * exposed by the Whereby SDK.
 */
export function useRoomConnection() {
    return useContext(RoomConnectionContext);
}