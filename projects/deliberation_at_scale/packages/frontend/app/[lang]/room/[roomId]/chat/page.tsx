import useAuth from '@/hooks/useAuth';
import RoomChatMessages from '@/components/RoomChatMessages';
import RoomParticipants from '@/components/RoomParticipants';

export default async function Chat() {
    await useAuth();

    return (
        <div className="h-full">
            <div className="sticky top-0 z-30">
                <RoomParticipants variant="compact" />
            </div>
            <RoomChatMessages />
        </div>
    );
}
