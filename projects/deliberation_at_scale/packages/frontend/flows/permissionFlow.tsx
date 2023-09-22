import { LOBBY_ALLOW_ASK_PERMISSION_STATE_KEY, LOBBY_WAITING_FOR_ROOM_STATE_KEY } from "@/utilities/constants";
import { ChatFlowConfig, FlowStep, QuickReply } from "./types";
import { PermissionState } from "@/state/slices/room";
import { isEmpty } from "radash";

const askPermissionQuickReply: QuickReply = {
    id: "permission_ask_yes",
    content: "Ask for permissions now",
    onClick: (helpers) => {
        helpers.setFlowStateEntry(LOBBY_ALLOW_ASK_PERMISSION_STATE_KEY, true);
        helpers.goToName('permission_verify_working');
    }
};

const permissionFlow: ChatFlowConfig = {
    id: "permission",
    steps: [
        {
            name: "permission_ask",
            messageOptions: [["Before we continue, you need to allow me to see your camera feed. We need this because we feel looking other people in the eye makes for a better discussion."]],
            timeoutMs: 2000, // keep this fixed to give devices time to initialize
        },
        {
            name: "permission_verify_working",
            messageOptions: [["Everything seems to be working fine. Let's get started!"]],
            skip: (helpers) => {
                const hasGivenPermission = helpers.roomState.permission === PermissionState.REQUESTED;

                if (!hasGivenPermission) {
                    helpers.goToName("permission_not_working");
                }

                return !hasGivenPermission;
            },
            quickReplies: [
                {
                    id: "find_room",
                    content: "Let's find me a room to join!",
                    hidden: (helpers) => {
                        return !isEmpty(helpers?.searchParams?.get('redirect'));
                    },
                    onClick: (helpers) => {
                        helpers.setFlowStateEntry(LOBBY_WAITING_FOR_ROOM_STATE_KEY, true);
                        helpers.goToName("waiting_for_room_0");
                    }
                },
                {
                    id: "to_existing_room",
                    content: "Continue to room",
                    hidden: (helpers) => {
                        return isEmpty(helpers?.searchParams?.get('redirect'));
                    },
                    onClick: (helpers) => {
                        const redirect = helpers?.searchParams?.get('redirect');

                        if (!redirect) {
                            helpers.goToName('find_room');
                            return;
                        }

                        helpers.goToPage(redirect);
                    }
                },
            ],
        },
        {
            name: "permission_not_working",
            messageOptions: [["It appears that you have not given me permission to use your camera. Please click the button below to try again."]],
            quickReplies: [
                askPermissionQuickReply,
            ],
        },
        ...([...Array(10)].map((_, waitingIndex) => {
            return {
                name: `waiting_for_room_${waitingIndex}`,
                messageOptions: [["Waiting for a room to be ready..."]],
                timeoutMs: 2000,
            } satisfies FlowStep;
        })),
    ]
};

export default permissionFlow;
