"use client";
import ChatFlow from "./index";
import { ChatFlowConfig } from "@/types/flows";
import { DEFAULT_BOT_MESSAGE_SPEED_MS } from "@/utilities/constants";
import { useLingui } from "@lingui/react";
import { useMemo } from "react";
import useQuickReplies from "@/hooks/useQuickReplies";
import useFlowSteps from "@/hooks/useFlowSteps";
import { msg } from "@lingui/macro";

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
                    messageOptions: [[_(msg`Hey there, welcome to this discussion. We appreciate that you're taking the time to contribute.`)]],
                    timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
                },
                {
                    name: "get_started",
                    messageOptions: [[_(msg`To get started, a registration link will be send to your email.`)]],
                    timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
                },
                askForEmailStep,
                {
                    name: "thank_you",
                    messageOptions: [[_(msg`Thank you! You will find an email with a login link in your inbox. After you click on this link, you will be redirected back to this application and ready to start finding common ground.`)]],
                    quickReplies: [resetQuickReply],
                }
            ]
        } satisfies ChatFlowConfig;
    }, [_, askForEmailStep, resetQuickReply]);

    return (
        <ChatFlow flow={flow}/>
    );
}
