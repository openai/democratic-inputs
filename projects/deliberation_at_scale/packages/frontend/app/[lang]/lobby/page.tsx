import useAuth from '@/hooks/useAuth';

export default async function Lobby() {
    await useAuth();

    return (
        <div className="flex v-screen h-screen items-center justify-center">
            <h1>Lobby flow</h1>
        </div>
    );
}