"use client";
import ChatFlow from "./index";
import { ChatFlowConfig } from "@/types/flows";
import { DEFAULT_BOT_MESSAGE_SPEED_MS } from "@/utilities/constants";
import { useLingui } from "@lingui/react";
import { useMemo } from "react";
import useQuickReplies from "@/hooks/useQuickReplies";
import useFlowSteps from "@/hooks/useFlowSteps";

export default function RegisterChatFlow() {
    const { _ } = useLingui();
    const { resetQuickReply } = useQuickReplies();
    const { askForEmailStep } = useFlowSteps();
    const flow = useMemo(() => {
        return {
            id: "register",
            userMessageTemplate: {
                name: 'You',
            },
            steps: [
                {
                    name: "greeting",
                    messageOptions: [[_(`Hey there, welcome to Deliberation at Scale. We appreciate that you're taking the time to contribute.`)]],
                    timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
                },
                {
                    name: "get_started",
                    messageOptions: [[_(`To get started, we need to send you a link for you to register with.`)]],
                    timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
                },
                askForEmailStep,
                {
                    name: "thank_you",
                    messageOptions: [[_(`Thank you! An email has been sent with a link to register with!`)]],
                    quickReplies: [resetQuickReply],
                }
            ]
        } satisfies ChatFlowConfig;
    }, [_, askForEmailStep, resetQuickReply]);

    return (
        <ChatFlow flow={flow}/>
    );
}
