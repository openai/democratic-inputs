import { ChatFlowConfig } from "./types";

const profileFlow: ChatFlowConfig = {
    id: "profile",
    steps: [
        {
            name: "welcome",
            messageOptions: [["Hi there {nickName}! What would you like to do?"]],
            quickReplies: [
                {
                    id: 'join-room',
                    content: 'Join a room',
                    onClick: async (helpers) => {
                        helpers.postBotMessages([["Great! Moving you to the lobby... Hold on tight!"]]);
                        await helpers.waitFor(2000);
                        helpers.goToPage('/lobby');
                    },
                },
                {
                    id: 'previous-rooms',
                    content: 'View results of previous rooms',
                    onClick: async (helpers) => {
                        // empty
                    },
                },
                {
                    id: 'change-profile',
                    content: 'Change my profile',
                    onClick: async (helpers) => {
                        // empty
                    },
                }
            ],
        },
    ]
};

export default profileFlow;
