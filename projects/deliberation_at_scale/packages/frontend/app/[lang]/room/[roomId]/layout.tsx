'use client';
import { joinRoom, leaveRoom } from '@/state/slices/room';
import { useAppDispatch } from '@/state/store';
import { useParams } from 'next/navigation';
import { PropsWithChildren, useEffect, useMemo } from 'react';
import RoomMenu from './menu';
import { useLocalMedia } from '@/hooks/useLocalMedia';
import { useRoomConnection } from '@/components/RoomConnection/context';
import Loader from '@/components/Loader';
import { useGetRoomsQuery } from '@/generated/graphql';

/**
 * This is the layout for all room interfaces, i.e. all interfaces in which a
 * participant is discussing with other participants.
 */
export default function RoomLayout({ children }: PropsWithChildren) {
    const localMedia = useLocalMedia();
    const connection = useRoomConnection();

    // Retrieve the roomId from the URL params
    const params = useParams();
    const roomId = useMemo(() => (
        params?.roomId && !Array.isArray(params.roomId) ? params.roomId : null
    ), [params?.roomId]);

    // Retrieve the room from the database
    const { data, loading } = useGetRoomsQuery({ variables: { roomId }, skip: !roomId });
    const room = useMemo(() => data?.roomsCollection?.edges?.[0], [data]);

    // Retrieve the Redux dispatch action
    const dispatch = useAppDispatch();

    // Determine whether everything is ready to display the room
    const isReady = useMemo(() => (
        roomId
        && room
        && !loading
        && connection
        && localMedia
        && localMedia.state?.localStream
        && connection?.state?.roomConnectionStatus !== 'connecting'
            ? true : false
    ), [roomId, localMedia, connection, room, loading]);

    useEffect(() => {
        // GUARD: Only attempt to join a room if one has successfully been found
        if (roomId && localMedia?.state?.localStream && room) {
            dispatch(joinRoom(room.node.id));
        }

        // Whenever the page is unmounted, we can leave the room
        return () => { dispatch(leaveRoom()); };
    }, [dispatch, localMedia, roomId, room]);

    // GUARD: Display loader when everything is not ready yet
    if (!isReady) {
        return <Loader />;
    }

    return (
        <div className="flex max-h-screen h-screen w-screen flex-col">
            <div className="flex-grow flex-shrink min-w-0 overflow-hidden">
                {children}
            </div>
            <RoomMenu />
        </div>
    );
}
