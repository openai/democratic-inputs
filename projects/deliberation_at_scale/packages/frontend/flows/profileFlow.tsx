import { faChartBar, faChartLine, faMessage, faUser } from '@fortawesome/free-regular-svg-icons';
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
                    icon: faMessage,
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
                    icon: faChartBar,
                    onClick: async () => {
                        // empty
                    },
                },
                {
                    id: 'change-profile',
                    content: 'Change my profile',
                    icon: faUser,
                    onClick: async () => {
                        // empty
                    },
                }
            ],
        },
    ]
};

export default profileFlow;
