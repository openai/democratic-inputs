import InvalidChatFlow from '@/components/ChatFlow/InvalidChatFlow';
import useAuth from '@/hooks/useAuth';

export default async function Idle() {
    await useAuth();

    return (
        <InvalidChatFlow />
    );
}
