import useAuth from '@/hooks/useAuth';
import LoginForm from './form';

export default async function Login() {
    await useAuth('unauthenticated', '/');

    return (
        <LoginForm />
    );
}
