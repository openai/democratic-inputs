import useAuth from '@/hooks/useAuth';
import RoomChatMessages from '@/components/RoomChatMessages';
import RoomParticipants from '@/components/RoomParticipants';

export default async function Chat() {
    await useAuth();

    return (
        <div className="h-full">
            <RoomParticipants variant="compact" />
            <RoomChatMessages />
        </div>
    );
}
