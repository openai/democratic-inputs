"use client";
import { motion } from "framer-motion";
import useTheme, { ThemeColors } from "@/hooks/useTheme";
import { usePathname } from "next/navigation";
import classNames from 'classnames';

const bgColorMap: Record<ThemeColors, string> = {
    'blue': 'text-blue-600',
    'green':  'text-green-600',
    'orange': 'text-orange-600',
};

export default function ColouredHeader() {
    const theme = useTheme();
    const pathname = usePathname();
    const isHidden = !!pathname?.includes('/room');

    return (
        <motion.header
            layoutId="coloured-header"
            className={classNames(
                'flex w-screen justify-start px-6 items-center text-foreground font-medium transition-all duration-1000 z-10 fixed backdrop-blur-xl border-b bg-white/35',
                isHidden ? 'h-0 opacity-0' : 'h-[64px] opacity-100',
                bgColorMap[theme],
            )}
        >
            <div className="max-w-[768px] w-full mx-auto">
                <p>
                    <motion.span
                        className="mr-3 translate-y-[-2px] inline-block text-xl"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        🦡
                    </motion.span>
                    <motion.span
                        className="inline-block"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        Deliberation at Scale
                    </motion.span>
                </p>
            </div>
        </motion.header>
    );
}
