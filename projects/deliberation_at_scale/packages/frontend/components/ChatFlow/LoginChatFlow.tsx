"use client";
import { ChatFlowConfig } from "@/types/flows";
import { DEFAULT_BOT_MESSAGE_SPEED_MS } from "@/utilities/constants";
import { useLingui } from "@lingui/react";
import { useMemo } from "react";
import ChatFlow from "./index";
import useFlowSteps from "@/hooks/useFlowSteps";
import useQuickReplies from "@/hooks/useQuickReplies";
import { msg } from "@lingui/macro";

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
                        _(msg`Hi, welcome back to Common Ground. We appreciate you taking the time to contribute.`),
                    ]],
                    timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
                },
                {
                    name: "data_justification",
                    messageOptions: [[
                        _(msg`To join conversations again, we need your e-mail address once more.`),
                    ]],
                    timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
                },
                askForEmailStep,
                {
                    name: "thank_you",
                    messageOptions: [[
                        _(msg`Thank you! You will find an email with a login link in your inbox. Be sure to check your SPAM folder as well!`),
                    ]],
                    timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
                },
                {
                    name: "thank_you_2",
                    messageOptions: [[
                        _(msg`After you click on this link, you will be redirected back to this application to be ready to start finding common ground.`),
                    ]],
                    quickReplies: [resetQuickReply],
                },
            ]
        } satisfies ChatFlowConfig;
    }, [_, askForEmailStep, resetQuickReply]);

    return (
        <ChatFlow flow={flow}/>
    );
}
