import { ChatFlowConfig } from "./types";

const idleFlow: ChatFlowConfig = {
    id: "idle",
    steps: [
        {
            name: "intro",
            messageOptions: [["Hi there {nickName}! It looks like you are not paying attention. Be aware people are waiting for you to confirm joining the room!"]],
            quickReplies: [
                {
                    id: 'retry',
                    content: 'Sorry, retry joining a room',
                    onClick: async (helpers) => {
                        helpers.postBotMessages([["Okay, pay attention! Moving you to the lobby once again..."]]);
                        await helpers.waitFor(2000);
                        helpers.goToPage('/lobby');
                    },
                },
                {
                    id: 'home',
                    content: 'Go back to home page',
                    onClick: async (helpers) => {
                        helpers.goToPage('/proifle');
                    },
                }
            ],
        },
    ]
};

export default idleFlow;
