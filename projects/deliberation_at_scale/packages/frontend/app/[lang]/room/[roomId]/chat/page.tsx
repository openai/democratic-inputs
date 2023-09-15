import useAuth from '@/hooks/useAuth';
import Participants from '../participants';

export default async function Chat() {
    await useAuth();

    return (
        <div>
            <Participants />
            <h1>I am on the Chat page</h1>
        </div>
    );
}