'use client';
import { motion } from 'framer-motion';

import useRoom from "@/hooks/useRoom";
import useTheme, { ThemeColors } from "@/hooks/useTheme";
import { Trans } from "@lingui/macro";
import ReactMarkdown from "react-markdown";
import { topicSolid } from "./EntityIcons";
import Pill from "./Pill";
import classNames from 'classnames';

const topicColorBgMap: Record<ThemeColors, string> = {
    'blue': 'bg-blue-400',
    'green': 'bg-green-400',
    'orange': 'bg-orange-400',
};

export interface TopicProps {
    variant?: 'compact' | 'spacious';
}

export default function RoomTopic({ variant }: TopicProps) {
    const { topic } = useRoom();
    const { content: topicContent } = topic ?? {};
    const theme = useTheme();

    if (!topicContent) {
        return;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={classNames("rounded gap-4 flex items-center", topicColorBgMap[theme], variant === 'compact' && 'md:mx-4 md:my-2 mb-1 p-2 md:p-4', variant === "spacious" && "p-4")}
        >
            <Pill icon={topicSolid} className="border-green-700"><Trans>Topic</Trans></Pill>
            <ReactMarkdown>{topicContent}</ReactMarkdown>
        </motion.div>
    );
}
