"use client";
import { motion } from "framer-motion";
import useTheme, { ThemeColors } from "@/hooks/useTheme";
import { usePathname } from "next/navigation";

const bgColorMap: Record<ThemeColors, string> = {
    'blue': 'bg-blue-400',
    'green': 'bg-green-400',
    'orange': 'bg-orange-400',
};

export default function ColouredHeader() {
    const theme = useTheme();
    const pathname = usePathname();
    const isHidden = !!pathname?.includes('/room');
    const className = `flex w-screen justify-center text-foreground ${isHidden ? 'h-0' : 'h-[var(--coloured-header-height)]'} ${bgColorMap[theme]} transition-all duration-1000 z-10`;

    return (
        <motion.header layoutId="coloured-header" className={className}>
        </motion.header>
    );
}
