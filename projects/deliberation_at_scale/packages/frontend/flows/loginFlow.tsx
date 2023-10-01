import { t } from "@lingui/macro";

import { ChatFlowConfig } from "./types";
import { resetQuickReply } from "./quickReplies";
import { askForEmailStep } from "./steps";
import { DEFAULT_BOT_MESSAGE_SPEED_MS } from "@/utilities/constants";

const loginFlow: ChatFlowConfig = {
    id: "login",
    userMessageTemplate: {
        name: 'You',
    },
    steps: [
        {
            name: "greeting",
            messageOptions: [[
                t`Hey there, welcome to Deliberation at Scale. We appreciate that you're taking the time to contribute.`,
            ]],
            timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
        },
        {
            name: "data_justification",
            messageOptions: [[
                t`In order for you to easily rejoin earlier converstations, we need your e-mail address for identification.`,
            ]],
            timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
        },
        askForEmailStep,
        {
            name: "thank_you",
            messageOptions: [[t`Thank you! You will find a link to login to Deliberation at Scale in your inbox. Use this link to login.`]],
            quickReplies: [resetQuickReply],
        }
    ]
};

export default loginFlow;
