"use client";
import { ChatFlowConfig } from "@/types/flows";
import { DEFAULT_BOT_MESSAGE_SPEED_MS } from "@/utilities/constants";
import { faMessage, faChartBar, faUser } from "@fortawesome/free-regular-svg-icons";
import { useLingui } from "@lingui/react";
import { useMemo } from "react";
import ChatFlow from "./index";
import { msg } from "@lingui/macro";

export default function ProfileChatFlow() {
    const { _ } = useLingui();
    const flow = useMemo(() => {
        return {
            id: "profile",
            steps: [
                {
                    name: "welcome",
                    messageOptions: [[_(msg`Hi there [nickName]! Welcome to Deliberation at Scale. If you feel ready to join a discussion, we'd love to set you up with other participants.`)]],
                    timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
                },
                {
                    name: "choose",
                    messageOptions: [[_(msg`What would you like to do?`)]],
                    quickReplies: [
                        {
                            id: 'join-room',
                            icon: faMessage,
                            content: _(msg`Join a conversation`),
                            onClick: async (helpers) => {
                                helpers.postBotMessages([[_(msg`Great! Moving you to the waiting lobby... Hold on tight!`)]]);
                                await helpers.waitFor(2000);
                                helpers.goToPage('/lobby');
                            },
                        },
                        {
                            id: 'previous-rooms',
                            content: _(msg`View results of previous conversations`),
                            icon: faChartBar,
                            onClick: async () => {
                                // empty
                            },
                        },
                        {
                            id: 'change-profile',
                            content: _(msg`Change my profile`),
                            icon: faUser,
                            onClick: async () => {
                                // empty
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
