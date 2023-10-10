'use client';
import useRoom from '@/hooks/useRoom';
import RoomOutcome from './RoomOutcome';
import { motion, AnimatePresence } from 'framer-motion';

export default function LatestRoomOutcome() {
    const { outcomes, participantId } = useRoom();
    const lastOutcome = outcomes?.[0];
    const hasOutcome = !!lastOutcome;
    const { id: outcomeId } = lastOutcome ?? {};

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, height: hasOutcome ? 'auto' : 0 }}
        >
            <AnimatePresence>
                {hasOutcome && (
                    <motion.div
                        exit={{ opacity: 0, y: -40 }}
                        className='mx-2 md:mx-4 my-2 p-4 border shadow rounded'
                    >
                        <RoomOutcome variant="compact" key={outcomeId} outcome={lastOutcome} participantId={participantId} />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

