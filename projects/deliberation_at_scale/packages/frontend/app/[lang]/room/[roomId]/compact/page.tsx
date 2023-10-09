import useAuth from '@/hooks/useAuth';
import RoomChatMessages from '@/components/RoomChatMessages';
import RoomParticipants from '@/components/RoomParticipants';

export default async function Compact() {
    await useAuth();

    return (
        <div className="h-full flex flex-col min-h-0">
            <RoomParticipants variant="compact" />
            <RoomChatMessages />
        </div>
    );
}
