"use client";
import { motion } from "framer-motion";
import useColorClassName from "@/hooks/useTintedThemeColor";

export default function ColouredHeader() {
    const bgColor = useColorClassName({ classNamePrefix: 'bg' });
    const className = `flex w-screen justify-center text-foreground h-0 ${bgColor} transition-colors duration-1000 z-10`;

    return (
        <motion.header layoutId="coloured-header" className={className}>
        </motion.header>
    );
}
