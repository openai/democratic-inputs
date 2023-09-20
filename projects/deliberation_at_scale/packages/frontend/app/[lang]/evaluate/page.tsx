import EvaluateChatFlow from '@/components/ChatFlow/EvaluateChatFlow';
import useAuth from '@/hooks/useAuth';

export default async function Lobby() {
    await useAuth();

    return (
        <EvaluateChatFlow />
    );
}
