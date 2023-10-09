import useAuth from '@/hooks/useAuth';
import RoomChatMessages from '@/components/RoomChatMessages';
import RoomParticipants from '@/components/RoomParticipants';
import RoomTopic from '@/components/RoomTopic';
import LatestRoomOutcome from '@/components/LatestRoomOutcome';

export default async function Compact() {
    await useAuth();

    return (
        <div className="h-full flex flex-col min-h-0">
            <RoomTopic variant="compact" />
            <RoomParticipants variant="compact" />
            <LatestRoomOutcome />
            <RoomChatMessages />
        </div>
    );
}
