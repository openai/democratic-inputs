import useAuth from '@/hooks/useAuth';

export default async function Join() {
    await useAuth();
    
    return (
        <div className="flex v-screen h-screen items-center justify-center">
            <h1>Join flow</h1>
        </div>
    );
}