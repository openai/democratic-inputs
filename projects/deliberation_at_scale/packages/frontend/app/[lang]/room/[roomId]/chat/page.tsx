import useAuth from '@/hooks/useAuth';
import RoomChatMessages from '@/components/RoomChatMessages';
import RoomParticipants from '@/components/RoomParticipants';

export default async function Chat() {
    await useAuth();

    return (
        <div className="h-full flex flex-col">
            <div className="sticky top-0 z-30 px-4">
                <RoomParticipants variant="compact" />
            </div>
            <RoomChatMessages />
        </div>
    );
}
