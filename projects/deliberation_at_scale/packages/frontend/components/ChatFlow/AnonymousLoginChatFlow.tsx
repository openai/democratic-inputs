"use client";
import { ChatFlowConfig } from "@/types/flows";
import { DEFAULT_BOT_MESSAGE_SPEED_MS } from "@/utilities/constants";
import { useLingui } from "@lingui/react";
import { useMemo } from "react";
import ChatFlow from "./index";
import useQuickReplies from "@/hooks/useQuickReplies";
import { msg } from "@lingui/macro";
import { getAnonymousLoginLink } from "@/utilities/supabase";

export default function AnonymousLoginChatFlow() {
    const { _ } = useLingui();
    const { resetQuickReply } = useQuickReplies();
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
                        _(msg`Hi, welcome to Common Ground. We appreciate you taking the time to contribute.`),
                    ]],
                    timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
                },
                {
                    name: "data_justification",
                    messageOptions: [[
                        _(msg`To join conversations, we need your Prolific ID to verify that you are a Prolific user.`),
                    ]],
                    timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
                },
                {
                    name: "ask_for_identifiewr",
                    messageOptions: [[_(msg`Please enter your Prolific ID below:`)]],
                    quickReplies: [resetQuickReply],
                    onInput: async (input, helpers) => {
                        const { content: identifier } = input;
                        const formattedContent = identifier?.trim();

                        helpers.postBotMessages([[_(msg`Thank you. Getting login details...`)]]);
                        try {
                            const { loginLink } = await getAnonymousLoginLink(formattedContent);
                            helpers.postBotMessages([[_(msg`Logging you in...`)]]);
                            helpers.waitFor(DEFAULT_BOT_MESSAGE_SPEED_MS);

                            // if (true) {
                            //     const localLoginLink = loginLink.replace('https://findcommonground.vercel.app/', 'http://localhost:3200/');
                            //     window.location.assign(localLoginLink);
                            //     return;
                            // }

                            window.location.assign(loginLink);
                        } catch (error) {
                            helpers.postBotMessages([[_(msg`There was an error getting the login details. Please try again!`)]]);

                            // dont clear the chat input field!
                            return false;
                        }

                        return;
                    },
                },
            ]
        } satisfies ChatFlowConfig;
    }, [_, resetQuickReply]);

    return (
        <ChatFlow flow={flow}/>
    );
}
