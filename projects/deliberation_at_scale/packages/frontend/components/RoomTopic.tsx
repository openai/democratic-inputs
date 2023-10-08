import { motion } from 'framer-motion';

import useRoom from "@/hooks/useRoom";
import useTheme, { ThemeColors } from "@/hooks/useTheme";
import { Trans } from "@lingui/macro";
import ReactMarkdown from "react-markdown";
import { topicSolid } from "./EntityIcons";
import Pill from "./Pill";

const topicColorBgMap: Record<ThemeColors, string> = {
    'blue': 'bg-blue-400',
    'green': 'bg-green-400',
    'orange': 'bg-orange-400',
};

export default function RoomTopic() {
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
            className={`p-4 rounded gap-4 flex items-center ${topicColorBgMap[theme]}`}
        >
            <Pill icon={topicSolid} className="border-green-700"><Trans>Topic</Trans></Pill>
            <ReactMarkdown>{topicContent}</ReactMarkdown>
        </motion.div>
    );
}
