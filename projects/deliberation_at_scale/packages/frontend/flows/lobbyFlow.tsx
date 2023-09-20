import { DEFAULT_BOT_MESSAGE_SPEED_MS, LOBBY_ALLOW_ASK_PERMISSION_STATE_KEY, LOBBY_WAITING_FOR_ROOM_STATE_KEY } from "@/utilities/constants";
import { ChatFlowConfig, FlowStep } from "./types";
import { PermissionState } from "@/state/slices/room";

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
            messageOptions: [["If you have any questions at any point, you can ask them using the box below."]],
            timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
        },
        {
            name: "permission_ask",
            messageOptions: [["Before we can get started, you need to allow me to see your camera feed. We need this because we feel looking other people in the eye makes for a better discussion."]],
            quickReplies: [
                {
                    id: "permission_ask_yes",
                    content: "Ask for permissions now",
                    onClick: (helpers) => {
                        helpers.setFlowStateEntry(LOBBY_ALLOW_ASK_PERMISSION_STATE_KEY, true);
                        helpers.goToNext();
                    }
                },
                {
                    id: "permission_confirm",
                    content: "The camera and microphone are all set up!",
                    onClick: (helpers) => {
                        helpers.goToNext();
                    }
                },
            ],
        },
        {
            name: "permission_verify_working",
            messageOptions: [["Everything seems to be working fine. Let's get started!"]],
            skip: (helpers) => {
                const hasGivenPermission = helpers.storeState.room.permission === PermissionState.REQUESTED;

                if (!hasGivenPermission) {
                    helpers.goToName("permission_not_working");
                }

                return !hasGivenPermission;
            },
            quickReplies: [
                {
                    id: "lets_go",
                    content: "Let's go!",
                    onClick: (helpers) => {
                        helpers.setFlowStateEntry(LOBBY_WAITING_FOR_ROOM_STATE_KEY, true);
                        helpers.goToName("waiting_for_room_0");
                    }
                },
            ],
        },
        {
            name: "permission_not_working",
            messageOptions: [["It appears that you have not given me permission to use your camera. Please click the button below to try again."]],
            quickReplies: [
                {
                    id: "permission_yes",
                    content: "Ask for permissions now",
                    onClick: (helpers) => {
                        helpers.goToName("permission_ask");
                    }
                },
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

export default lobbyFlow;
