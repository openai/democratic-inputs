"use client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { t } from '@lingui/macro';

import useColorClassName from '@/hooks/useTintedThemeColor';
import { Message } from '@/flows/types';
import useProfile from '@/hooks/useProfile';
import { useCallback, useMemo } from 'react';
import { replaceTextVariables } from '@/utilities/text';

export default function ChatMessage(props: Message) {
    const { content, name, nameIcon, date, highlighted = false} = props;
    const highlightedBgColor = useColorClassName({ classNamePrefix: 'bg', tint: 200 });
    const nameTextColor = useColorClassName({ classNamePrefix: 'text', tint: 800 });
    const { user } = useProfile();
    const nickName = user?.nick_name ?? t`You`;
    const hasDate = !!date;
    const parsedDate = dayjs(date);
    const isToday = parsedDate.isSame(dayjs(), 'day');
    const formattedDate = dayjs(date).format(isToday ? 'HH:mm' : 'DD/MM/YYYY HH:mm');
    const wrapperClassName = `flex flex-col gap-1 grow width-full rounded-md px-4 py-4 shadow-sm transition-colors duration-1000 ${highlighted ? highlightedBgColor : ''}`;
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
        return replaceMessageVariables(content);
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
            <div className="flex justify-between text-sm uppercase opacity-70">
                <div className="self-start flex content-center">
                    {nameIcon && (
                        <span className="pr-1"><FontAwesomeIcon icon={nameIcon} /></span>
                    )}
                    <span className={nameTextColor}>{formattedName}</span>
                </div>
                {hasDate && (
                    <div className="self-end">
                        {formattedDate}
                    </div>
                )}
            </div>
            <div>
                <ReactMarkdown>
                    {formattedContent}
                </ReactMarkdown>
            </div>
        </motion.div>
    );
}