"use client";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { isEmpty } from "radash";
import { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { motion } from 'framer-motion';

import { UserInput } from "@/types/flows";
import useTheme, { ThemeColors } from '@/hooks/useTheme';
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/macro";
import useIsMobile from "@/hooks/useIsMobile";

const submitBgColorMap: Record<ThemeColors, string> = {
    'blue': 'bg-blue-500',
    'green': 'bg-green-500',
    'orange': 'bg-orange-500',
};

const focusColorMap: Record<ThemeColors, string> = {
    'blue': 'ring-blue-400',
    'green': 'ring-green-400',
    'orange': 'ring-orange-400',
};

const hoverBorderMap: Record<ThemeColors, string> = {
    'blue': 'focus-within:border-blue-400',
    'green': 'focus-within:border-green-400',
    'orange': 'focus-within:border-orange-400',
};

export interface ChatInputProps {
    onSubmit: (input: UserInput) => Promise<boolean>;
    disabled?: boolean;
    placeholder?: string;
}

export default function ChatInput(props: ChatInputProps) {
    const { _ } = useLingui();
    const defaultPlaceholder = _(msg`Tap to type`);
    const { onSubmit, disabled = false, placeholder = defaultPlaceholder} = props;
    const theme = useTheme();
    const isMobile = useIsMobile();
    const inputRef = useRef<HTMLInputElement>(null);
    const [input, setInput] = useState('');
    const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
        const validatedInput = input.trim();
        const userInput: UserInput = { content: validatedInput };
        e.preventDefault();

        // guard: check if the content is valid
        if (isEmpty(validatedInput)) {
            return;
        }

        const hasBeenSent = await onSubmit(userInput);

        // only clear when the message was sent out
        if (hasBeenSent) {
            setInput('');
        }
    }, [input, onSubmit, setInput]);
    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    }, [setInput]);

    // focus the input when it is enabled
    useEffect(() => {
        if (disabled) {
            return;
        }

        if (inputRef.current && !isMobile) {
            inputRef.current.focus();
        }
    }, [inputRef, disabled, isMobile]);

    return(
        <motion.form
            layoutId="chat-input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ y: 100 }}
            onSubmit={handleSubmit}
            className={`relative z-10 ${disabled ? 'grayscale cursor-not-allowed' : ''}`}
        >
            <div className={`flex rounded-md border w-full bg-white focus-within:ring ${focusColorMap[theme]} ${hoverBorderMap[theme]}`}>
                <input
                    ref={inputRef}
                    className={`py-3 px-4 outline-none rounded-md border-none w-full bg-none`}
                    placeholder={placeholder}
                    value={input}
                    onChange={handleChange}
                    disabled={disabled}
                />
                <motion.button
                    type="submit"
                    className={`transition-colors duration-1000 rounded m-2 p-2 w-10 aspect-square shrink-0 text-white ${submitBgColorMap[theme]}`}
                    whileTap={{ scale: (disabled ? 1: 0.9) }}
                    disabled={disabled}
                >
                    <FontAwesomeIcon icon={faPaperPlane} />
                </motion.button>
            </div>
        </motion.form>
    );
}
