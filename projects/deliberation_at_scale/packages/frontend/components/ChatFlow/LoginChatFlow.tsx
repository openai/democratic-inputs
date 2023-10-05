"use client";
import { ChatFlowConfig } from "@/types/flows";
import { DEFAULT_BOT_MESSAGE_SPEED_MS } from "@/utilities/constants";
import { useLingui } from "@lingui/react";
import { useMemo } from "react";
import ChatFlow from "./index";
import useFlowSteps from "@/hooks/useFlowSteps";
import useQuickReplies from "@/hooks/useQuickReplies";

export default function LoginChatFlow() {
    const { _ } = useLingui();
    const { resetQuickReply } = useQuickReplies();
    const { askForEmailStep } = useFlowSteps();
    const flow = useMemo(() => {
        return {
            id: "login",
            userMessageTemplate: {
                name: 'You',
            },
            steps: [
                {
                    name: "greeting",
                    messageOptions: [[
                        _(`Hey there, welcome to Deliberation at Scale. We appreciate that you're taking the time to contribute.`),
                    ]],
                    timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
                },
                {
                    name: "data_justification",
                    messageOptions: [[
                        _(`In order for you to easily rejoin earlier converstations, we need your e-mail address for identification.`),
                    ]],
                    timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
                },
                askForEmailStep,
                {
                    name: "thank_you",
                    messageOptions: [[_(`Thank you! You will find a link to login to Deliberation at Scale in your inbox. Use this link to login.`)]],
                    quickReplies: [resetQuickReply],
                }
            ]
        } satisfies ChatFlowConfig;
    }, [_, askForEmailStep, resetQuickReply]);

    return (
        <ChatFlow flow={flow}/>
    );
}
