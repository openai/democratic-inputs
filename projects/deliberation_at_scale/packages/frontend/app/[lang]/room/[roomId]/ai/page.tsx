import useAuth from '@/hooks/useAuth';
import RoomParticipants from '@/components/RoomParticipants';
import RoomChatSummary from '@/components/RoomChatSummary';

export default async function AI() {
    await useAuth();

    return (
        <div className="h-full">
            <div className="sticky top-0 z-30">
                <RoomParticipants variant="spacious" />
            </div>
            <RoomChatSummary />
        </div>
    );
}
