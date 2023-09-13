import { NavLink } from '@/components/NavLink';
import { useAppSelector } from '@/state/store';

export default function RoomMenu() {
    const currentRoomId = useAppSelector((state) => state.room.currentRoomId);

    return (
        <nav className="flex gap-4">
            <NavLink href={`/room/${currentRoomId}/ai`} activeClassName="font-bold">
                AI
            </NavLink>
            <NavLink href={`/room/${currentRoomId}/chat`} activeClassName="font-bold">
                Chat
            </NavLink>
        </nav>
    );
}