'use client';

import useRoom from '@/hooks/useRoom';
import RoomOutcome from './RoomOutcome';


export default function LatestRoomOutcome() {
    const { outcomes, participantId } = useRoom();
    const lastOutcome = outcomes?.[outcomes.length - 1];
    const { id: outcomeId } = lastOutcome ?? {};
    return <div className='mx-2 md:mx:4 my-2 p-4 border shadow rounded'>

        <RoomOutcome variant="compact" key={outcomeId} outcome={lastOutcome} participantId={participantId} />

    </div>;
}

