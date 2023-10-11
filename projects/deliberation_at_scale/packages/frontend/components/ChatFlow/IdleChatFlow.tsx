"use client";
import { ChatFlowConfig } from "@/types/flows";
import { faRotate, faHomeAlt } from "@fortawesome/free-solid-svg-icons";
import { useLingui } from "@lingui/react";
import { useMemo } from "react";
import ChatFlow from "./index";
import { msg } from "@lingui/macro";

export default function IdleChatFlow() {
    const { _ } = useLingui();
    const flow = useMemo(() => {
        return {
            id: "idle",
            steps: [
                {
                    name: "intro",
                    messageOptions: [[_(msg`Hello [nickName]. You have been idle for a while. Would you still like to join a conversation?`)]],
                    quickReplies: [
                        {
                            id: 'retry',
                            icon: faRotate,
                            content: _(msg`Try joining a room again`),
                            onClick: async (helpers) => {
                                helpers.postBotMessages([[_(msg`Okay! Moving you to the lobby.`)]]);
                                await helpers.waitFor(2000);
                                helpers.goToPage('/lobby');
                            },
                        },
                        {
                            id: 'home',
                            icon: faHomeAlt,
                            content: _(msg`Go back to profile page`),
                            onClick: async (helpers) => {
                                helpers.goToPage('/proifle');
                            },
                        }
                    ],
                },
            ]
        } satisfies ChatFlowConfig;
    }, [_]);

    return (
        <ChatFlow flow={flow}/>
    );
}
