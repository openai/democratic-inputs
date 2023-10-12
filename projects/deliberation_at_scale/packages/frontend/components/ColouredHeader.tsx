"use client";
import { motion } from "framer-motion";
import useTheme, { ThemeColors } from "@/hooks/useTheme";
import { usePathname } from "next/navigation";
import classNames from 'classnames';
import useProfile from "@/hooks/useProfile";
import Image from "next/image";
import wordmark from "@/public/images/wordmark.png";

import { useCallback } from "react";
import useLocalizedPush from "@/hooks/useLocalizedPush";

const bgColorMap: Record<ThemeColors, string> = {
    'blue': 'text-blue-600',
    'green':  'text-green-600',
    'orange': 'text-orange-600',
};

export default function ColouredHeader() {
    const theme = useTheme();
    const { push } = useLocalizedPush();
    const { isLoggedIn } = useProfile();
    const pathname = usePathname();
    const isHidden = !!pathname?.includes('/room');
    const navTo = isLoggedIn ? '/profile' : '/';
    const goToProfile = useCallback(() => push(navTo), [push, navTo]);

    return (
        <motion.header
            layoutId="coloured-header"
            className={classNames(
                'flex w-screen justify-start px-2 md:px-6 items-center text-foreground font-medium transition-all duration-1000 z-10 fixed backdrop-blur-xl border-b bg-white/35',
                isHidden ? 'h-0 opacity-0' : 'h-[64px] opacity-100',
                bgColorMap[theme],
            )}
        >
            <div className="max-w-[768px] w-full mx-auto">
                {!isHidden && (
                    <div onClick={goToProfile} className="hover:cursor-pointer">
                        <motion.span
                            className="inline-block"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Image className="h-10 w-auto" src={wordmark} alt="" />
                        </motion.span>
                    </div>
                )}
            </div>
        </motion.header>
    );
}
