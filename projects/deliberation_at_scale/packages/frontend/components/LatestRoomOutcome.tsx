'use client';
import useRoom from '@/hooks/useRoom';
import RoomOutcome from './RoomOutcome';
import { motion, AnimatePresence } from 'framer-motion';
import useScrollToBottom from '@/hooks/useScrollToBottom';

export default function LatestRoomOutcome() {
    const { outcomes, participantId, participants } = useRoom();
    const lastOutcome = outcomes?.[0];
    const hasOutcome = !!lastOutcome;
    const { id: outcomeId } = lastOutcome ?? {};

    // automatically scroll to the bottom when a new outcome appears
    useScrollToBottom({ data: lastOutcome });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, height: hasOutcome ? 'auto' : 0 }}
        >
            <AnimatePresence>
                {hasOutcome && (
                    <motion.div
                        exit={{ opacity: 0, y: -40 }}
                        className='mt-1 md:mx-4 p-2 md:p-4 border z-50 rounded'
                    >
                        <RoomOutcome variant="compact" key={outcomeId} outcome={lastOutcome} participantId={participantId} participants={participants} />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

