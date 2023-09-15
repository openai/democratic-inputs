import useAuth from '@/hooks/useAuth';
import Participants from '../participants';

export default async function AI() {
    await useAuth();

    return (
        <div>
            <Participants />
            <h1>I am on the AI page</h1>
        </div>
    );
}