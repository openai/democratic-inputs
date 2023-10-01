"use client";
import { motion, AnimatePresence } from 'framer-motion';

import { RoomAction } from '@/hooks/useRoomActions';
import Button from './Button';

interface Props {
    actions: RoomAction[];
}

export default function ChatActions(props: Props) {
    const { actions } = props;
    const variants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, x: -50 },
    };

    return (
        <div className="flex flex-col gap-2">
            <AnimatePresence>
                {actions.map((action) => {
                    const { id, icon, title, onClick } = action;

                    return (
                        <motion.div
                            key={id}
                            variants={variants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <Button icon={icon} onClick={onClick}>{title}</Button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
