"use client";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { isEmpty } from "radash";
import { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { motion } from 'framer-motion';
import { t } from "@lingui/macro";

import { UserInput } from "@/flows/types";
import useColorClassName from "@/hooks/useTintedThemeColor";

export interface ChatInputProps {
    onSubmit: (input: UserInput) => Promise<boolean>;
    disabled?: boolean;
    placeholder?: string;
}

export default function ChatInput(props: ChatInputProps) {
    const defaultPlaceholder = t`Tap to type`;
    const { onSubmit, disabled = false, placeholder = defaultPlaceholder} = props;
    const submitBgColor = useColorClassName({ classNamePrefix: 'bg', tint: 500 });
    const focusColor = useColorClassName({ classNamePrefix: 'ring', tint: 400 });
    const hoverBorder = useColorClassName({ classNamePrefix: 'focus-within:border', tint: 400 });
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

        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [inputRef, disabled]);

    return(
        <motion.form
            layoutId="chat-input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ y: 100 }}
            onSubmit={handleSubmit}
            className={`relative ${disabled ? 'grayscale cursor-not-allowed' : ''}`}
        >
            <div className={`flex rounded-md border w-full bg-white focus-within:ring ${focusColor} ${hoverBorder}`}>
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
                    className={`transition-colors duration-1000 rounded-lg m-2 p-2 w-10 aspect-square shrink-0 text-white ${submitBgColor}`}
                    whileTap={{ scale: (disabled ? 1: 0.9) }}
                    disabled={disabled}
                >
                    <FontAwesomeIcon icon={faPaperPlane} />
                </motion.button>
            </div>
        </motion.form>
    );
}
