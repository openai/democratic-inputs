import useAuth from '@/hooks/useAuth';
import { redirect } from 'next/navigation';

export default async function Room({ params }: { params: { roomId: string } }) {
    await useAuth();
    redirect(`/room/${params.roomId}/ai`);
}