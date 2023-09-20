import LobbyChatFlow from '@/components/ChatFlow/LobbyChatFlow';
import useAuth from '@/hooks/useAuth';

export default async function Lobby() {
    await useAuth();

    return (
        <LobbyChatFlow />
    );
}
