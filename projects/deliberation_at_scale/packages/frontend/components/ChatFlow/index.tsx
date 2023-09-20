"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { draw, isEmpty } from "radash";
import { AnimatePresence, motion } from "framer-motion";
import { v4 as uuid } from "uuid";

import { ChatFlowConfig as FlowType, Message, UserInput, MessagesOptions, MessageTemplate, OnInputHelpers, FlowStep } from "../../flows/types";
import sleep from "@/utilities/sleep";
import ChatInput from "../ChatInput";
import ChatMessageList from "../ChatMessageList";
import Button from "../Button";
import { aiSolid } from "../EntityIcons";
import { useAppDispatch, useAppSelector } from "@/state/store";
import { setFlowStateEntry as setFlowStateEntryAction } from "@/state/slices/flow";
import dayjs from "dayjs";

interface Props {
    flow: FlowType;
}
const defaultUserMessageTemplate: MessageTemplate = {
    name: "{nickName}",
};
const defaultBotMessageTemplate: MessageTemplate = {
    name: "Deliberation at Scale",
    nameIcon: aiSolid,
    highlighted: true,
};

export default function ChatFlow(props: Props) {
    const { flow } = props;
    const {
        id: flowId,
        steps,
        userMessageTemplate = defaultUserMessageTemplate,
        botMessageTemplate = defaultBotMessageTemplate,
    } = flow;
    const { push } = useRouter();
    const storeState = useAppSelector((state) => state);
    const flowStateLookup = storeState.flow.flowStateLookup;
    const dispatch = useAppDispatch();
    const flowStateEntries = useMemo(() => {
        return flowStateLookup[flowId] ?? {};
    }, [flowId, flowStateLookup]);
    const [positionIndex, setPositionIndex] = useState(0);
    const [flowMessages, setFlowMessages] = useState<Message[]>([]);
    const [inputDisabled, setInputDisabled] = useState(false);
    const currentStep = steps?.[positionIndex] as (FlowStep | undefined);
    const { hideInput = false, quickReplies = [], onTimeout } = currentStep ?? {};
    const hasQuickReplies = !isEmpty(quickReplies);
    const isTextInputDisabled = useMemo(() => {
        const { onInput, hideInput } = currentStep ?? {};
        return inputDisabled || !onInput || hideInput;
    }, [inputDisabled, currentStep]);
    const inputPlaceholder = useMemo(() => {
        if (isTextInputDisabled) {
            return hasQuickReplies ? "Select an option above..." : "Waiting...";
        }

        return undefined;
    }, [hasQuickReplies, isTextInputDisabled]);

    /** State helpers */
    const reset = useCallback(() => {
        setPositionIndex(0);
        setFlowMessages([]);
    }, [setPositionIndex, setFlowMessages]);
    const setFlowStateEntry = useCallback((key: string, value: any) => {
        dispatch(setFlowStateEntryAction({
            id: flowId,
            key,
            value,
        }));
    }, [dispatch, flowId]);

    /* Navigation helpers */
    const goTo = useCallback((deltaIndex: number) => {
        setPositionIndex((currentPositionIndex) => {
            const newPositionIndex = currentPositionIndex + deltaIndex;

            // guard: check that the new position is not out of bounds
            if (newPositionIndex < 0 || newPositionIndex > flow.steps.length - 1) {
                return currentPositionIndex;
            }

            return newPositionIndex;
        });
    }, [flow]);
    const goToNext = useCallback(() => {
        goTo(1);
    }, [goTo]);
    const goToPrevious = useCallback(() => {
        goTo(-1);
    }, [goTo]);
    const goToPage = useCallback((path: string) => {
        push(path);
    }, [push]);

    /* This will advance to a subflow of choice */
    const goToName = useCallback((name: string) => {
        const index = flow.steps.findIndex((step) => {
            return step?.name === name;
        });
        const deltaIndex = index - positionIndex;

        goTo(deltaIndex);
    }, [flow, goTo, positionIndex]);

    /* This will add a message to the log */
    const postMessages = useCallback((messages: Message[]) => {

        // Append the messages to the array
        setFlowMessages((currentMessages) => {
            return currentMessages.concat(messages);
        });
    }, []);
    const getMessageFromTemplate = useCallback((messagesOptions: MessagesOptions, messageTemplate: MessageTemplate) => {
        const selectedMessages = draw(messagesOptions) ?? [];
        const messages = selectedMessages.map((message) => {
            return {
                id: uuid(),
                ...messageTemplate,
                content: message,
                date: dayjs().toISOString(),
            } satisfies Message;
        });

        return messages;
    }, []);
    const postBotMessages = useCallback((messagesOptions: MessagesOptions) => {
        const messages = getMessageFromTemplate(messagesOptions, botMessageTemplate);

        postMessages(messages);
    }, [getMessageFromTemplate, postMessages, botMessageTemplate]);
    const postUserMessages = useCallback((messagesOptions: MessagesOptions) => {
        const messages = getMessageFromTemplate(messagesOptions, userMessageTemplate);

        postMessages(messages);
    }, [getMessageFromTemplate, postMessages, userMessageTemplate]);
    const onInputHelpers: OnInputHelpers = useMemo(() => {
        return {
            goToPage,
            goToName,
            goToPrevious,
            goToNext,
            postBotMessages,
            postUserMessages,
            setFlowStateEntry,
            flowStateEntries,
            storeState,
            reset,
            waitFor: async (timeoutMs: number) => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve();
                    }, timeoutMs);
                });
            }
        } satisfies OnInputHelpers;
    }, [goToPage, goToName, goToPrevious, goToNext, postBotMessages, postUserMessages, setFlowStateEntry, flowStateEntries, storeState, reset]);

    useEffect(()=>{
        // use an AbortController to prevent acting on timeout if user input resolves it
        const controller = new AbortController();
        const signal = controller.signal;

        async function timeoutHandler() {
            const { timeoutMs } = currentStep ?? {};

            if (timeoutMs) {
                // Await the timeout
                await sleep(timeoutMs);

                // GUARD: double-check that the signal hasn't been aborted yet
                if(!signal.aborted){
                    // If sleep is over and we haven't been aborted, handle the onTimeout or go to the next flow
                    if (onTimeout) {
                        onTimeout(onInputHelpers);
                    } else {
                        goToNext();
                    }
                }
            }
        }

        async function skipHandler() {
            let skipResult = currentStep?.skip?.(onInputHelpers);

            if (skipResult instanceof Promise) {
                setInputDisabled(true);
                skipResult = await skipResult;
                setInputDisabled(false);
            }
            return skipResult;
        }

        async function handler() {

            // GUARD: Check if we need to skip this subflow
            if (await skipHandler()) {
                return;
            }

            // If not, add the messages and potentially await a timeout
            postBotMessages(currentStep?.messageOptions ?? []);
            await timeoutHandler();
        }

        handler();

        // clean up on unmount
        return () => {
            // Whenever we progress in the flow before all timeouts can occur,
            // we throw an abort signal so we don't trigger any resolving promises.
            controller.abort(); // abort timer functionality
        };
    }, [currentStep, goToName, goToNext, onInputHelpers, onTimeout, postBotMessages, setInputDisabled]);

    /* Handler for any user input */
    const handleInput = useCallback(async (input: UserInput) => {
        const { onInput } = currentStep ?? {};

        // Run the onInput function
        setInputDisabled(true);
        try {
            await onInput?.(input, onInputHelpers);
        } catch (error) {
            postBotMessages([["Something went wrong! Please try again."]]);
            console.error(error);
        }
        setInputDisabled(false);
    }, [currentStep, onInputHelpers, postBotMessages]);

    return (
        <div className="flex flex-col gap-2">
            <ChatMessageList messages={flowMessages} />
            <div className="sticky bottom-2 pt-4 flex flex-col gap-3">
                <AnimatePresence>
                    {!isEmpty(quickReplies) && (
                        <motion.div
                            key="quickReplies"
                            className="flex flex-col gap-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {quickReplies.map((quickReply) => {
                                const { id, onClick, content, icon } = quickReply;
                                const key = `${id}-${content}`;

                                return (
                                    <Button
                                        key={key}
                                        disabled={inputDisabled}
                                        onClick={async () => {
                                            setInputDisabled(true);
                                            try {
                                                await onClick(onInputHelpers);
                                            } catch (error) {
                                                postBotMessages([["Something went wrong! Please try again."]]);
                                                console.error(error);
                                            }
                                            setInputDisabled(false);
                                        }}
                                    >
                                        {icon && (
                                            <FontAwesomeIcon icon={icon} />
                                        )}
                                        <span>{content}</span>
                                    </Button>
                                );
                            })}
                        </motion.div>
                    )}
                    {!hideInput && (
                        <ChatInput
                            key="chatInput"
                            onSubmit={handleInput}
                            disabled={isTextInputDisabled}
                            placeholder={inputPlaceholder}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

