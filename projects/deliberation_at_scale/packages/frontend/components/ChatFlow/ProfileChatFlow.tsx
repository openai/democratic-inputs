"use client";
import { ChatFlowConfig } from "@/types/flows";
import { DEFAULT_BOT_MESSAGE_SPEED_MS } from "@/utilities/constants";
import { faMessage, faChartBar, faUser } from "@fortawesome/free-regular-svg-icons";
import { useLingui } from "@lingui/react";
import { useCallback, useMemo } from "react";
import ChatFlow from "./index";
import { msg } from "@lingui/macro";
import { supabaseClient } from "@/state/supabase";
import { faReplyAll, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { RoomStatusType, useGetRoomsQuery } from "@/generated/graphql";
import useRealtimeQuery from "@/hooks/useRealtimeQuery";

export default function ProfileChatFlow() {
    const { _ } = useLingui();
    const logout = useCallback(() => supabaseClient.auth.signOut(), []);
    const { data: roomsData, loading: roomsLoading } = useRealtimeQuery(useGetRoomsQuery());
    const rooms = useMemo(() => roomsData?.roomsCollection?.edges.map((room) => room.node), [roomsData]);
    const latestRoom = useMemo(() => rooms?.[0], [rooms]);
    const hasLatestRoom = !!latestRoom && latestRoom.active && latestRoom.status_type !== RoomStatusType.End;
    const flow = useMemo(() => {
        return {
            id: "profile",
            steps: [
                {
                    name: "welcome", // Possibly unnecessary to and mention 'Common Ground' and mention 'Deliberation at Scale'. But using both makes it sound big, which I like.
                    messageOptions: [[_(msg`
                        Welcome to Common Ground!
                        Dive into our conversation about the future of AI.
                        Remember, your unique perspective enriches the conversation.
                        Let's get started!
                    `)]],
                    timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
                },
                {
                    name: "choose",
                    messageOptions: [[]],
                    quickReplies: [
                        {
                            hidden: () => !hasLatestRoom || roomsLoading,
                            id: 'rejoin-room',
                            icon: faReplyAll,
                            content: _(msg`Rejoin your last conversation`),
                            onClick: async (helpers) => {
                                helpers.postBotMessages([[_(msg`Rejoining your last conversation...`)]]);
                                await helpers.waitFor(1000);
                                helpers.goToPage(`/room/${latestRoom?.id}`);
                            },
                        },
                        {
                            id: 'join-room',
                            icon: faMessage,
                            content: _(msg`Participate in a new conversation`),
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
    }, [_, hasLatestRoom, latestRoom?.id, logout, roomsLoading]);

    return (
        <ChatFlow flow={flow}/>
    );
}
