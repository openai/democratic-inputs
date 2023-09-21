import PermissionChatFlow from '@/components/ChatFlow/PermissionChatFlow';
import useAuth from '@/hooks/useAuth';

export default async function Permission() {
    await useAuth();

    return (
        <PermissionChatFlow />
    );
}
