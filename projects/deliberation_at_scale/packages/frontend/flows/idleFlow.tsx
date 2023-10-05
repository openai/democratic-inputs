import { faHomeAlt, faRotate } from '@fortawesome/free-solid-svg-icons';
import { t } from "@lingui/macro";

import { ChatFlowConfig } from "./types";

const idleFlow: ChatFlowConfig = {
    id: "idle",
    steps: [
        {
            name: "intro",
            messageOptions: [[t`Hi there [nickName]! It looks like you are not paying attention. Be aware people are waiting for you to confirm joining the room!`]],
            quickReplies: [
                {
                    id: 'retry',
                    icon: faRotate,
                    content: t`Sorry, retry joining a room`,
                    onClick: async (helpers) => {
                        helpers.postBotMessages([[t`Okay, pay attention! Moving you to the lobby once again...`]]);
                        await helpers.waitFor(2000);
                        helpers.goToPage('/lobby');
                    },
                },
                {
                    id: 'home',
                    icon: faHomeAlt,
                    content: t`Go back to home page`,
                    onClick: async (helpers) => {
                        helpers.goToPage('/proifle');
                    },
                }
            ],
        },
    ]
};

export default idleFlow;
