"use client";
import { ChatFlowConfig } from "@/types/flows";
import { faRotate, faHomeAlt } from "@fortawesome/free-solid-svg-icons";
import { useLingui } from "@lingui/react";
import { useMemo } from "react";
import ChatFlow from "./index";
import { msg } from "@lingui/macro";

export default function InvalidChatFlow() {
    const { _ } = useLingui();
    const flow = useMemo(() => {
        return {
            id: "idle",
            steps: [
                {
                    name: "intro",
                    messageOptions: [[_(msg`Hmmm, it appears the conversation could not be joined or the other participants took too long to join. Sorry about that!`)]],
                    quickReplies: [
                        {
                            id: 'retry',
                            icon: faRotate,
                            content: _(msg`Retry joining a room`),
                            onClick: async (helpers) => {
                                helpers.postBotMessages([[_(msg`Moving you to the lobby again, one moment please...`)]]);
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
