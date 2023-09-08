import { redirect } from 'next/navigation';

export default function Room({ params }: { params: { roomId: string } }) {
    redirect(`/room/${params.roomId}/ai`);
}