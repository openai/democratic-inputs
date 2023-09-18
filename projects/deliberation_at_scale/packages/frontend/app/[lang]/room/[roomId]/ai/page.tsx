import useAuth from '@/hooks/useAuth';
import Participants from '../participants';
import Pill from '@/components/Pill';
import { aiSolid, topicSolid } from '@/components/EntityIcons';

export default async function AI() {
    await useAuth();

    return (
        <div className="h-full max-w-xl m-auto p-4">
            <Participants variant="spacious" />
            <div className="bg-green-400 p-4 rounded mb-4 gap-4 flex items-center">
                <Pill icon={topicSolid} className="border-green-700">Topic</Pill>
                This is the topic for today&apos;s conversation.
            </div>
            <Pill icon={aiSolid} className="mb-4">AI Moderator</Pill>
            <p>This is some input for your friendly neighbordhood AI Moderator.</p>
        </div>
    );
}