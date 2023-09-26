"use client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { t } from '@lingui/macro';

import useTheme, { ThemeColors } from '@/hooks/useTheme';
import { Message } from '@/flows/types';
import useProfile from '@/hooks/useProfile';
import { useCallback, useMemo } from 'react';
import { replaceTextVariables } from '@/utilities/text';

const highlightedBgColorMap: Record<ThemeColors, string> = {
    'blue': 'bg-blue-100',
    'green': 'bg-green-100',
    'orange': 'bg-orange-100',
};

const headerTextColorMap: Record<ThemeColors, string> = {
    'blue': 'text-blue-800',
    'green': 'text-green-800',
    'orange': 'text-orange-800',
};

const bodyTextColorMap: Record<ThemeColors, string> = {
    'blue': 'text-blue-900',
    'green': 'text-green-900',
    'orange': 'text-orange-900',
};

interface Props {
    message: Message;
    enablePadding?: boolean;
    header?: boolean;
}

export default function ChatMessage(props: Props) {
    const { message, enablePadding = true, header = true } = props;
    const { content, name, nameIcon, date, highlighted = false} = message;
    const theme = useTheme();
    const { user } = useProfile();
    const nickName = user?.nick_name ?? t`You`;
    const hasDate = !!date;
    const parsedDate = dayjs(date);
    const isToday = parsedDate.isSame(dayjs(), 'day');
    const formattedDate = dayjs(date).format(isToday ? 'HH:mm' : 'DD/MM/YYYY HH:mm');
    const wrapperClassName = `flex flex-col gap-1 grow width-full rounded-md ${enablePadding ? 'p-4' : ''} transition-colors duration-1000 ${highlighted ? highlightedBgColorMap[theme] : ''} group`;
    const variants = {
        hidden: { opacity: 0, y: 70 },
        visible: { opacity: 1, y: 0 },
    };
    const replaceMessageVariables = useCallback((text: string) => {
        return replaceTextVariables(text, {
            nickName,
        });
    }, [nickName]);
    const formattedContent = useMemo(() => {
        return replaceMessageVariables(content).trim();
    }, [content, replaceMessageVariables]);
    const formattedName = useMemo(() => {
        return replaceMessageVariables(name ?? t`Anonymous`);
    }, [name, replaceMessageVariables]);

    return (
        <motion.div
            layout
            className={wrapperClassName}
            variants={variants}
            initial="hidden"
            animate="visible"
        >
            {header && (
                <div className={`flex justify-between text-sm uppercase opacity-50 ${highlighted ? headerTextColorMap[theme] : 'opacity-20'} group-hover:opacity-90 transition-opacity`}>
                    <div className="self-start inline-flex content-center items-center gap-2">
                        {nameIcon && (
                            <span><FontAwesomeIcon icon={nameIcon} /></span>
                        )}
                        <span>{formattedName}</span>
                    </div>
                    {hasDate && (
                        <div className="self-end">
                            {formattedDate}
                        </div>
                    )}
                </div>
            )}
            <div className={highlighted ? bodyTextColorMap[theme] : undefined}>
                <ReactMarkdown>
                    {formattedContent}
                </ReactMarkdown>
            </div>
        </motion.div>
    );
}
