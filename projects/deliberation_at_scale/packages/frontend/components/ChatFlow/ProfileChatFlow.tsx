"use client";
import { ChatFlowConfig } from "@/types/flows";
import { DEFAULT_BOT_MESSAGE_SPEED_MS } from "@/utilities/constants";
import { faMessage, faChartBar, faUser } from "@fortawesome/free-regular-svg-icons";
import { useLingui } from "@lingui/react";
import { useCallback, useMemo } from "react";
import ChatFlow from "./index";
import { msg } from "@lingui/macro";
import { supabaseClient } from "@/state/supabase";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

export default function ProfileChatFlow() {
    const { _ } = useLingui();
    const logout = useCallback(() => supabaseClient.auth.signOut(), []);
    const flow = useMemo(() => {
        return {
            id: "profile",
            steps: [
                {
                    name: "welcome", // Possibly unnecessary to and mention 'Common Ground' and mention 'Deliberation at Scale'. But using both makes it sound big, which I like.
                    messageOptions: [[_(msg`Hi there [nickName]! Welcome to Common Ground. This application was developed by the consortium Deliberation at Scale together with OpenAI. When you feel ready to join a discussion, we can set you up with other participants.`)]],
                    timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
                },
                {
                    name: "choose",
                    messageOptions: [[_(msg`What would you like to do?`)]],
                    quickReplies: [
                        {
                            id: 'join-room',
                            icon: faMessage,
                            content: _(msg`Join the conversation`),
                            onClick: async (helpers) => {
                                helpers.postBotMessages([[_(msg`Great! Moving you to the waiting lobby... Hold on tight!`)]]);
                                await helpers.waitFor(2000);
                                helpers.goToPage('/lobby');
                            },
                        },
                        {
                            id: 'logout',
                            icon: faRightFromBracket,
                            content: _(msg`Logout`),
                            onClick: async (helpers) => {
                                helpers.postBotMessages([[_(msg`Logging you out...`)]]);
                                await logout();
                                await helpers.waitFor(1000);
                                helpers.goToPage('/');
                            },
                        },
                        {
                            hidden: () => true,
                            id: 'previous-rooms',
                            content: _(msg`View results of previous conversations`),
                            icon: faChartBar,
                            onClick: async () => {
                                // empty
                            },
                        },
                        {
                            hidden: () => true,
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
