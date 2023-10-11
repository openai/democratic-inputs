"use client";
import { faHammer, faHandsHelping, faPaperPlane, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { isEmpty } from "radash";
import { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { motion } from 'framer-motion';

import { UserInput } from "@/types/flows";
import useTheme, { ThemeColors } from '@/hooks/useTheme';
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/macro";
import Button from "./Button";
import toast from "react-hot-toast";

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
    helpAvailable?: boolean;
}

export default function ChatInput(props: ChatInputProps) {
    const { _ } = useLingui();
    const defaultPlaceholder = _(msg`Tap to type`);
    const { onSubmit, disabled = false, placeholder = defaultPlaceholder, helpAvailable} = props;
    const theme = useTheme();
    const [helpMenu, setHelpMenu] = useState(false);
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

    async function fetchAdmin() {
        return new Promise((resolve) => {
            setTimeout(() => {
                // you can resolve or reject here based on some condition
                // for example, let's resolve the promise:
                resolve("Facilitator available");
            }, 1232);
        });
    }
    async function fetchTechie() {
        return new Promise((resolve) => {
            setTimeout(() => {
                // you can resolve or reject here based on some condition
                // for example, let's resolve the promise:
                resolve("No Technicians Available");
            }, 3200);
        });
    }

    return(
        <motion.form
            layoutId="chat-input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ y: 100 }}
            onSubmit={handleSubmit}
            className={`relative flex gap-2 z-10 ${disabled ? 'grayscale cursor-not-allowed' : ''}`}
        >
            {helpAvailable && (
                <div className="relative aspect-square group shrink-0 m-1"
                    onMouseLeave={function (): void {
                        setHelpMenu(false);
                    }}>

                    <motion.button
                        type="button"
                        className={`duration-300 h-full peer w-full peer rounded-full grow saturate-0 group-hover:saturate-100 transition-all text-white bg-red-300`}
                        whileTap={{ scale: (disabled ? 1: 0.9) }}
                        disabled={disabled}
                        onClick={function (): void {
                            // const preHelpMenu = helpMenu;
                            setHelpMenu(!helpMenu);
                            console.log(helpMenu);
                        }}
                    >
                        <FontAwesomeIcon icon={faUserPlus} />
                    </motion.button>
                    {helpMenu && (
                        <motion.div className="absolute w-max z-50 hover:opacity-100 transition-opacity -translate-y-full top-0 text-black flex flex-col gap-1 pb-4">
                            <Button className="p-2 shadow-xl" onClick={function (): void {
                                const promiseAdmin = fetchAdmin();
                                toast.promise(
                                    promiseAdmin,
                                    {
                                        loading: 'Looking for facilitator',
                                        success: () => `Facilitator on the way!`,
                                        error: (err) => `This just happened: ${err.toString()}`,
                                    },
                                    {
                                        style: {
                                            minWidth: '250px',
                                        },
                                        success: {
                                            duration: 5000,
                                            icon: '🤙',
                                        },
                                        loading: {
                                            duration: 5000,
                                            icon: '👀',
                                        },
                                    }
                                );
                            } }>
                                <FontAwesomeIcon icon={faHammer} />
                            Call a Facilitator
                            </Button>
                            <Button className="p-2 shadow-xl" onClick={function (): void {
                                const promiseAdmin = fetchTechie();
                                toast.promise(
                                    promiseAdmin,
                                    {
                                        loading: 'Looking for technician',
                                        success: () => `Technician on the way!`,
                                        error: (err) => `This just happened: ${err.toString()}`,
                                    },
                                    {
                                        style: {
                                            minWidth: '250px',
                                        },
                                        success: {
                                            duration: 5000,
                                            icon: '🏃‍♂️',
                                        },
                                        loading: {
                                            duration: 5000,
                                            icon: '👀',
                                        },
                                    }
                                );
                            } }>
                                <FontAwesomeIcon icon={faHandsHelping} />
                            Call a Technician
                            </Button>
                    
                        </motion.div>
                    )}
                </div>
            )}
            
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
