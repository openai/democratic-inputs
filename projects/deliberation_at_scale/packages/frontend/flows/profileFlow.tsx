import { faChartBar, faMessage, faUser } from '@fortawesome/free-regular-svg-icons';
import { ChatFlowConfig } from "./types";
import { DEFAULT_BOT_MESSAGE_SPEED_MS } from '@/utilities/constants';

const profileFlow: ChatFlowConfig = {
    id: "profile",
    steps: [
        {
            name: "welcome",
            messageOptions: [["Hi there {nickName}! Welcome to Deliberation at Scale. If you feel ready to join a discussion, we'd love to set you up with other participants."]],
            timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
        },
        {
            name: "choose",
            messageOptions: [["What would you like to do?"]],
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
