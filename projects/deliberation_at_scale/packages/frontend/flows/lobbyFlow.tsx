import { DEFAULT_BOT_MESSAGE_SPEED_MS } from "@/utilities/constants";
import { ChatFlowConfig } from "./types";

const lobbyFlow: ChatFlowConfig = {
    id: "lobby",
    steps: [
        {
            name: "greeting_1",
            messageOptions: [["Hi there {nickName}! I hope you're ready to get started discussing the future of AI."]],
            timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
        },
        {
            name: "greeting_2",
            messageOptions: [["First, I need to ask you a few questions."]],
            timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
        },
        {
            name: "greeting_2",
            messageOptions: [["What nickname would you like to use? You can also choose your current name."]],
            quickReplies: [
                {
                    id: "use_current_nickname",
                    content: "Use my current nickname",
                    onClick: (helpers) => {
                        helpers.goToName('use_current_nickname');
                    }
                }
            ],
            onInput: async (input, helpers) => {
                helpers.setFlowStateEntry('nickname', input.content);
                helpers.goToNext();
            }
        },
        {
            name: "use_current_nickname",
            messageOptions: [["Great, we'll keep calling you {nickName}."]],
            timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
        },
        {
            name: "ask_go_to_permission_flow",
            messageOptions: [["Now we need to setup your camera and microphone."]],
            quickReplies: [
                {
                    id: "go_to_permission_flow",
                    content: "Sure thing, let's set it up!",
                    onClick: (helpers) => {
                        helpers.goToPage('/lobby/permission');
                    }
                }
            ],
        },
    ]
};

export default lobbyFlow;
