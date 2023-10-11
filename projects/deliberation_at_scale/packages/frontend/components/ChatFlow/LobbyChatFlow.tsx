"use client";
import { ChatFlowConfig } from "@/types/flows";
import { DEFAULT_BOT_MESSAGE_SPEED_MS } from "@/utilities/constants";
import { faThumbsUp } from "@fortawesome/free-regular-svg-icons";
import { faSignature } from "@fortawesome/free-solid-svg-icons";
import { useLingui } from "@lingui/react";
import { useMemo } from "react";
import ChatFlow from "./index";
import { msg } from "@lingui/macro";

export default function LobbyChatFlow() {
    const { _ } = useLingui();
    const flow = useMemo(() => {
        return {
            id: "lobby",
            steps: [
                {
                    name: "greeting_1",
                    messageOptions: [[_(msg`Before joining the conversation, let's pick a nick name and configure your camera and microphone.`)]],
                    timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
                },
                {
                    name: "greeting_2",
                    messageOptions: [[_(msg`What nickname would you like to use? You can also choose your current name "[nickName]".`)]],
                    quickReplies: [
                        {
                            id: "use_current_nickname",
                            content: _(msg`Use my current nickname`),
                            icon: faSignature,
                            onClick: (helpers) => {
                                helpers.goToName('use_current_nickname');
                            }
                        }
                    ],
                    onInput: async (input, helpers) => {
                        helpers.setFlowStateEntry('nickName', input.content);
                        helpers.goToName("use_new_nickname");
                    }
                },
                {
                    name: "use_current_nickname",
                    messageOptions: [[_(msg`Great, your nick name will be "[nickName]".`)]],
                    timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
                    onTimeout: async (helpers) => {
                        helpers.goToName("ask_go_to_permission_flow");
                    },
                },
                {
                    name: "use_new_nickname",
                    messageOptions: [[_(msg`Great, your nick name will be "[nickName]".`)]],
                    timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
                },
                {
                    name: "ask_go_to_permission_flow",
                    messageOptions: [[_(msg`Now your camera and microphone need to be configured.`)]],
                    quickReplies: [
                        {
                            id: "go_to_permission_flow",
                            content: _(msg`Sure!`),
                            icon: faThumbsUp,
                            onClick: (helpers) => {
                                helpers.goToPage('/lobby/permission');
                            }
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
