import { faHomeAlt, faRotate } from '@fortawesome/free-solid-svg-icons';
import { t } from "@lingui/macro";

import { ChatFlowConfig } from "./types";

const idleFlow: ChatFlowConfig = {
    id: "idle",
    steps: [
        {
            name: "intro",
            messageOptions: [[t`Hmmm, it appears the room could not be joined or the other participants took to long to join.`]],
            quickReplies: [
                {
                    id: 'retry',
                    icon: faRotate,
                    content: t`Retry joining a room`,
                    onClick: async (helpers) => {
                        helpers.postBotMessages([[t`Okay! Moving you to the lobby once again...`]]);
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
