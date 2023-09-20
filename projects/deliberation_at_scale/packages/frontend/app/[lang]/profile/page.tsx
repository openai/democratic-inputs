import ProfileChatFlow from '@/components/ChatFlow/ProfileChatFlow';
import useAuth from '@/hooks/useAuth';

export default async function Profile() {
    await useAuth();

    return (
        <ProfileChatFlow />
    );
}
