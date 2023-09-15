import useAuth from '@/hooks/useAuth';

export default async function Register() {
    await useAuth();

    return (
        <div className="flex v-screen h-screen items-center justify-center">
            <h1>Register flow</h1>
        </div>
    );
}