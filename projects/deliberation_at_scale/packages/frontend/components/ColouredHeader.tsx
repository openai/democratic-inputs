"use client";
import { motion } from "framer-motion";
import useColorClassName from "@/hooks/useTintedThemeColor";
import { usePathname } from "next/navigation";

export default function ColouredHeader() {
    const bgColor = useColorClassName({ classNamePrefix: 'bg' });
    const pathname = usePathname();
    const isHidden = !!pathname?.includes('/room');
    const className = `flex w-screen justify-center text-foreground ${isHidden ? 'h-0' : 'h-[var(--coloured-header-height)]'} ${bgColor} transition-all duration-1000 z-10`;

    return (
        <motion.header layoutId="coloured-header" className={className}>
        </motion.header>
    );
}
