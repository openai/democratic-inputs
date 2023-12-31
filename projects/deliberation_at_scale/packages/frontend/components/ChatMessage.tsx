"use client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { msg } from "@lingui/macro";

import useTheme, { ThemeColors } from '@/hooks/useTheme';
import { Message } from '@/types/flows';
import useProfile from '@/hooks/useProfile';
import { useCallback, useMemo } from 'react';
import { replaceTextVariables } from '@/utilities/text';
import classNames from 'classnames';
import { useLingui } from '@lingui/react';

const highlightedBgColorMap: Record<ThemeColors, string> = {
    'blue': 'bg-blue-100',
    'green': 'bg-green-100',
    'orange': 'bg-orange-100',
};

const headerTextColorMap: Record<ThemeColors, string> = {
    'blue': 'text-blue-900',
    'green': 'text-green-900',
    'orange': 'text-orange-900',
};

const bodyTextColorMap: Record<ThemeColors, string> = {
    'blue': 'text-blue-900',
    'green': 'text-green-900',
    'orange': 'text-orange-900',
};

interface Props {
    message: Message;
    enablePadding?: boolean;
    first?: boolean;
    last?: boolean;
    className?: string;
}

export default function ChatMessage(props: Props) {
    const { _ } = useLingui();
    const { message, enablePadding = true, first = false, last = false, className } = props;
    const { content, name, nameIcon, date, highlighted = false, flagged = false, flaggedReason } = message;
    const theme = useTheme();
    const { nickName } = useProfile();
    const hasDate = !!date;
    const parsedDate = dayjs(date);
    const isToday = parsedDate.isSame(dayjs(), 'day');
    const formattedDate = dayjs(date).format(isToday ? 'HH:mm' : 'DD/MM/YYYY HH:mm');
    const wrapperClassName = classNames(
        `flex flex-col gap-1 md:gap-2 first:mt-4 -z-10 rounded transition-colors duration-1000 group shrink-1`,
        enablePadding && (highlighted ? 'p-[7px] pl-[8px] md:p-4' : 'px-[8px] md:px-4 pt-[5px] md:pt-2'),
        highlighted && highlightedBgColorMap[theme],
        first && 'rounded-t-xl',
        first && !highlighted && 'pt-[7px] md:pt-4',
        last && 'rounded-br-xl',
        last && !highlighted && 'pb-[7px] md:pb-4',
        className
    );
    const variants = {
        hidden: { opacity: 0, y: 70, maxHeight: 0 },
        visible: { opacity: 1, y: 0, maxHeight: 10_000 },
    };
    const replaceMessageVariables = useCallback((text: string) => {
        return replaceTextVariables(text, {
            nickName,
        });
    }, [nickName]);
    const formattedContent = useMemo(() => {
        const flaggedContent = (!flagged || !flaggedReason) ? content : flaggedReason;
        return replaceMessageVariables(flaggedContent).trim();
    }, [content, flaggedReason, flagged, replaceMessageVariables]);
    const formattedName = useMemo(() => {
        return replaceMessageVariables(name ?? _(msg`Contributor`));
    }, [_, name, replaceMessageVariables]);

    // guard: skip when message is invalid
    if (!formattedContent) {
        return null;
    }

    return (
        <motion.div
            layout
            className={wrapperClassName}
            variants={variants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.15, bounce: 1 }}
        >
            {first && (
                <div className={`flex justify-between text-sm uppercase opacity-70 ${highlighted ? headerTextColorMap[theme] : 'opacity-[.70]'} group-hover:opacity-90 transition-opacity`}>
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
