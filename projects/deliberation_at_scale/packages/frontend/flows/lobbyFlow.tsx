import { t } from "@lingui/macro";
import { faThumbsUp } from '@fortawesome/free-regular-svg-icons';
import { faSignature } from '@fortawesome/free-solid-svg-icons';

import { DEFAULT_BOT_MESSAGE_SPEED_MS } from "@/utilities/constants";
import { ChatFlowConfig } from "./types";

const lobbyFlow: ChatFlowConfig = {
    id: "lobby",
    steps: [
        {
            name: "greeting_1",
            messageOptions: [[t`Hi there {nickName}! I hope you're ready to get started discussing the future of AI.`]],
            timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
        },
        {
            name: "greeting_2",
            messageOptions: [[t`First, I need to ask you a few questions.`]],
            timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
        },
        {
            name: "greeting_2",
            messageOptions: [[t`What nickname would you like to use? You can also choose your current name \"{nickName}\".`]],
            quickReplies: [
                {
                    id: "use_current_nickname",
                    content: t`Use my current nickname`,
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
            messageOptions: [[t`Great, we'll keep calling you \"{nickName}\".`]],
            timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
            onTimeout: async (helpers) => {
                helpers.goToName("ask_go_to_permission_flow");
            },
        },
        {
            name: "use_new_nickname",
            messageOptions: [[t`Great, we'll call you \"{nickName}\".`]],
            timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
        },
        {
            name: "ask_go_to_permission_flow",
            messageOptions: [[t`Now we need to setup your camera and microphone.`]],
            quickReplies: [
                {
                    id: "go_to_permission_flow",
                    content: t`Sure thing, let's set it up!`,
                    icon: faThumbsUp,
                    onClick: (helpers) => {
                        helpers.goToPage('/lobby/permission');
                    }
                }
            ],
        },
    ]
};

export default lobbyFlow;
