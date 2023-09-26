import { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import dayjs from "dayjs";

const UPDATE_PROGRESS_INTERVAL_MS = 100;

interface Props {
    durationMs?: number;
    startReferenceTime?: string;
    hideOnComplete?: boolean;
    onIsCompleted?: (completed: boolean) => void;
}

export default function TimeProgressBar(props: Props) {
    const { durationMs = 0, startReferenceTime, hideOnComplete = false, onIsCompleted } = props;
    const [timePassedMs, setTimePassedMs] = useState(dayjs().diff(startReferenceTime, 'ms'));
    const hasDuration = durationMs > 0; // timeoutMs > 0 && !hasExistingOpinion;
    const durationLeftMs = Math.max(durationMs - timePassedMs, 0);
    const percentageDone = Math.ceil(100 - (hasDuration ? durationLeftMs / durationMs : 0) * 100);
    const isCompleted = hasDuration && (percentageDone >= 100);

    // periodially adjust the time
    useEffect(() => {
        const timePassedInterval = setInterval(() => {
            setTimePassedMs((currentTimePassedMs) => {
                return currentTimePassedMs + UPDATE_PROGRESS_INTERVAL_MS;
            });
        }, UPDATE_PROGRESS_INTERVAL_MS);

        return () => {
            clearInterval(timePassedInterval);
        };
    }, [setTimePassedMs]);

    // trigger completion to parent if needed
    useEffect(() => {
        onIsCompleted?.(isCompleted);
    }, [isCompleted, onIsCompleted]);

    if (!hasDuration || (isCompleted && hideOnComplete)) {
        return null;
    }

    return (
        <motion.div
            className="rounded-lg w-full h-[8px] bg-green-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentageDone}%` }}
                className="rounded-lg h-full bg-green-800"
            ></motion.div>
        </motion.div>
    );
}
