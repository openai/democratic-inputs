'use client';
import { joinRoom, leaveRoom } from '@/state/slices/room';
import { useAppDispatch } from '@/state/store';
import Room from '@/components/Room';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PropsWithChildren, useEffect, useMemo } from 'react';

/**
 * This is the layout for all room interfaces, i.e. all interfaces in which a
 * participant is discussing with other participants.
 */
export default function RoomLayout({ children }: PropsWithChildren) {
    // Retrieve the roomId from the URL params
    const params = useParams();
    const roomId = useMemo(() => (
        params?.roomId && !Array.isArray(params.roomId) ? params.roomId : null 
    ), [params?.roomId]);

    // Retrieve the Redux dispatch action
    const dispatch = useAppDispatch();

    useEffect(() => {
        // GUARD: Only attempt to join a room if one has successfully been found
        if (roomId) {
            dispatch(joinRoom(roomId));
        }
        
        // Whenever the page is unmounted, we can leave the room
        return () => { dispatch(leaveRoom()); };
    }, [dispatch, roomId]);

    return (
        <>
            <Room />
            {children}
            <Link href={`/room/${roomId}/ai`}>AI</Link>
            <Link href={`/room/${roomId}/chat`}>Chat</Link>
        </>
    );
}