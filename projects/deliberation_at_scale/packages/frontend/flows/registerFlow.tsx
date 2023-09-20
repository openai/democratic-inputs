import { ChatFlowConfig } from "./types";
import { resetQuickReply } from "./quickReplies";
import { askForEmailStep } from "./steps";
import { DEFAULT_BOT_MESSAGE_SPEED_MS } from "@/utilities/constants";

const registerFlow: ChatFlowConfig = {
    id: "register",
    userMessageTemplate: {
        name: 'You',
    },
    steps: [
        {
            name: "greeting",
            messageOptions: [["Very nice to meet you!"], ["Hello there!"]],
            timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
        },
        {
            name: "get_started",
            messageOptions: [["To get started, we need to send you a link for you to register with."]],
            timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
        },
        askForEmailStep,
        {
            name: "thank_you",
            messageOptions: [["Thank you! An email has been sent with a link to register with!"]],
            quickReplies: [resetQuickReply],
        }
    ]
};

export default registerFlow;
