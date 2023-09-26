import IdleChatFlow from '@/components/ChatFlow/IdleChatFlow';
import useAuth from '@/hooks/useAuth';

export default async function Idle() {
    await useAuth();

    return (
        <IdleChatFlow />
    );
}
