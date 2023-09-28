import { ENABLE_TEST_ROOM, LOBBY_ALLOW_ASK_PERMISSION_STATE_KEY, LOBBY_FOUND_ROOM_STATE_KEY, LOBBY_WAITING_FOR_ROOM_STATE_KEY, LOBBY_WANT_TO_JOIN_ROOM_STATE_KEY, ONE_SECOND_MS, TEST_ROOM_ID } from "@/utilities/constants";
import { ChatFlowConfig, OnInputHelpers, QuickReply } from "./types";
import { PermissionState } from "@/state/slices/room";
import { isEmpty } from "radash";
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const askPermissionQuickReply: QuickReply = {
    id: "permission_ask_yes",
    content: "Ask for permissions now",
    onClick: (helpers) => {
        helpers.setFlowStateEntry(LOBBY_ALLOW_ASK_PERMISSION_STATE_KEY, true);
        helpers.goToName('permission_verify_working');
    }
};

const waitingForRoomOnTimeout = async (helpers: OnInputHelpers, goToName: string) => {
    if (ENABLE_TEST_ROOM) {
        helpers.goToName("ask_to_enter_room");
        return;
    }

    const hasFoundRoom = helpers.flowStateEntries[LOBBY_FOUND_ROOM_STATE_KEY];

    // go to the other waiting step when no room was found
    // TODO: add mechanism to stop this look via a simple counter in the state?
    if (!hasFoundRoom) {
        helpers.goToName(goToName);
        return;
    }

    helpers.goToName("ask_to_enter_room");
};

const permissionFlow: ChatFlowConfig = {
    id: "permission",
    steps: [
        {
            name: "permission_ask",
            messageOptions: [["Before we continue, you will need to give permission to use your camera and microphone. We recommend giving those permissions because we prefer face-to-face discussions."]],
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
                    content: "Let's find a room to join!",
                    icon: faSearch,
                    hidden: (helpers) => {
                        return !isEmpty(helpers?.searchParams?.get('redirect'));
                    },
                    onClick: (helpers) => {
                        helpers.setFlowStateEntry(LOBBY_WAITING_FOR_ROOM_STATE_KEY, true);
                        helpers.goToName("waiting_for_room_1");
                    },
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
                    },
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
        {
            name: `waiting_for_room_1`,
            messageOptions: [["Waiting for a room to be ready..."]],
            timeoutMs: ONE_SECOND_MS * 5,
            onTimeout: (helpers) => {
                return waitingForRoomOnTimeout(helpers, 'waiting_for_room_2');
            },
        },
        {
            name: `waiting_for_room_2`,
            messageOptions: [["Waiting for a room to be ready..."]],
            timeoutMs: ONE_SECOND_MS * 5,
            onTimeout: (helpers) => {
                return waitingForRoomOnTimeout(helpers, 'waiting_for_room_1');
            },
        },
        {
            name: "ask_to_enter_room",
            messageOptions: [["A room has been found! Do you want to enter now?"]],
            quickReplies: [
                {
                    id: "enter_room",
                    content: "Enter room",
                    onClick: (helpers) => {
                        if (ENABLE_TEST_ROOM) {
                            helpers.goToPage(`/room/${TEST_ROOM_ID}`);
                            return;
                        }

                        helpers.setFlowStateEntry(LOBBY_WANT_TO_JOIN_ROOM_STATE_KEY, true);
                    }
                },
                {
                    id: "cancel_enter_room",
                    content: "No, go back to home page",
                    onClick: (helpers) => {
                        helpers.goToPage(`/profile`);
                    }
                },
            ],
        },
    ]
};

export default permissionFlow;
