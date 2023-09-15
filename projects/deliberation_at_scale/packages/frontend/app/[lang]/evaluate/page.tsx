import useAuth from '@/hooks/useAuth';

export default async function Evaluate() {
    await useAuth();

    return (
        <div className="flex v-screen h-screen items-center justify-center">
            <h1>Evaluate flow</h1>
        </div>
    );
}