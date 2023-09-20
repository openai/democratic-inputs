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
            messageOptions: [["Good to see you again"], ["Welcome back!"]],
            timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
        },
        askForEmailStep,
        {
            name: "thank_you",
            messageOptions: [["Thank you! An email has been sent with a link to login with!"]],
            quickReplies: [resetQuickReply],
        }
    ]
};

export default loginFlow;
