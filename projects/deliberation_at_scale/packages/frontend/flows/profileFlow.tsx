import { faChartBar, faMessage, faUser } from '@fortawesome/free-regular-svg-icons';
import { ChatFlowConfig } from "./types";
import { DEFAULT_BOT_MESSAGE_SPEED_MS } from '@/utilities/constants';
import { t } from '@lingui/macro';

const profileFlow: ChatFlowConfig = {
    id: "profile",
    steps: [
        {
            name: "welcome",
            messageOptions: [[t`Hi there [nickName]! Welcome to Deliberation at Scale. If you feel ready to join a discussion, we'd love to set you up with other participants.`]],
            timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
        },
        {
            name: "choose",
            messageOptions: [[t`What would you like to do?`]],
            quickReplies: [
                {
                    id: 'join-room',
                    icon: faMessage,
                    content: t`Join a conversation`,
                    onClick: async (helpers) => {
                        helpers.postBotMessages([[t`Great! Moving you to the waiting lobby... Hold on tight!`]]);
                        await helpers.waitFor(2000);
                        helpers.goToPage('/lobby');
                    },
                },
                {
                    id: 'previous-rooms',
                    content: t`View results of previous conversations`,
                    icon: faChartBar,
                    onClick: async () => {
                        // empty
                    },
                },
                {
                    id: 'change-profile',
                    content: t`Change my profile`,
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
