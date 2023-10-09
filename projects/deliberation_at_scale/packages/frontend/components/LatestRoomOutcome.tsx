'use client';
import useRoom from '@/hooks/useRoom';
import RoomOutcome from './RoomOutcome';
import { motion } from 'framer-motion';

export default function LatestRoomOutcome() {
    const { outcomes, participantId } = useRoom();
    const lastOutcome = outcomes?.[0];
    const { id: outcomeId } = lastOutcome ?? {};

    if (!lastOutcome) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className='mx-2 md:mx:4 my-2 p-4 border shadow rounded'
        >
            <RoomOutcome variant="compact" key={outcomeId} outcome={lastOutcome} participantId={participantId} />
        </motion.div>
    );
}

