"use client";
import useChatFlowState from "@/hooks/useChatFlowState";
import ChatFlow from "./index";
import RequestPermissions from "../LocalMedia/RequestPermissions";
import { ENABLE_TEST_ROOM, LOBBY_ALLOW_ASK_PERMISSION_STATE_KEY, LOBBY_FOUND_ROOM_STATE_KEY, LOBBY_WAITING_FOR_ROOM_STATE_KEY, LOBBY_WANT_TO_JOIN_ROOM_STATE_KEY, ONE_SECOND_MS, TEST_ROOM_ID } from "@/utilities/constants";
import WaitingForRoom from "../RoomConnection/WaitingForRoom";
import { ChatFlowConfig, OnInputHelpers, QuickReply } from "@/types/flows";
import { PermissionState } from "@/state/slices/room";
import { faSearch, faArrowRight, faHomeAlt } from "@fortawesome/free-solid-svg-icons";
import { useLingui } from "@lingui/react";
import { isEmpty } from "radash";
import { useMemo } from "react";

export default function PermissionChatFlow() {
    const { _ } = useLingui();
    const askPermissionQuickReply = useMemo(() => {
        return {
            id: "permission_ask_yes",
            content: _(`Ask for permissions now`),
            onClick: (helpers) => {
                helpers.setFlowStateEntry(LOBBY_ALLOW_ASK_PERMISSION_STATE_KEY, true);
                helpers.goToName('permission_verify_working');
            }
        } satisfies QuickReply;
    }, [_]);
    const flow = useMemo(() => {
        return {
            id: "permission",
            steps: [
                {
                    name: "permission_ask",
                    messageOptions: [[_(`Before we continue, you will need to give permission to use your camera and microphone. We recommend giving those permissions because we prefer face-to-face discussions.`)]],
                    timeoutMs: 2000, // keep this fixed to give devices time to initialize
                },
                {
                    name: "permission_verify_working",
                    messageOptions: async () => {
                        return [[_(`Everything seems to be working fine. Let's get started!`)]];
                    },
                    skip: (helpers) => {
                        const isVideoEnabled = helpers.mediaContext.state?.isVideoEnabled;
                        const isAudioEnabled = helpers.mediaContext.state?.isAudioEnabled;
                        const isRequested = helpers.roomState.permission === PermissionState.REQUESTED;
                        const hasGivenPermission = isRequested && isVideoEnabled && isAudioEnabled;

                        if (!hasGivenPermission) {
                            helpers.goToName("permission_not_working");
                        }

                        return !hasGivenPermission;
                    },
                    quickReplies: [
                        {
                            id: "find_room",
                            content: _(`Let's find a room to join!`),
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
                            content: _(`Continue to room`),
                            icon: faArrowRight,
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
                    messageOptions: [[_(`It appears that you have not given me permission to use your camera. Please click the button below to try again.`)]],
                    quickReplies: [
                        askPermissionQuickReply,
                    ],
                },
                {
                    name: `waiting_for_room_1`,
                    messageOptions: [[_(`Waiting for a room to be ready...`)]],
                    timeoutMs: ONE_SECOND_MS * 5,
                    onTimeout: (helpers) => {
                        return waitingForRoomOnTimeout(helpers, 'waiting_for_room_2');
                    },
                },
                {
                    name: `waiting_for_room_2`,
                    messageOptions: [[_(`Waiting for a room to be ready...`)]],
                    timeoutMs: ONE_SECOND_MS * 5,
                    onTimeout: (helpers) => {
                        return waitingForRoomOnTimeout(helpers, 'waiting_for_room_1');
                    },
                },
                {
                    name: "ask_to_enter_room",
                    messageOptions: [[_(`A room has been found! Do you want to enter now?`)]],
                    quickReplies: [
                        {
                            id: "enter_room",
                            content: _(`Enter room`),
                            icon: faArrowRight,
                            onClick: (helpers) => {
                                if (ENABLE_TEST_ROOM) {
                                    helpers.goToPage(`/room/${TEST_ROOM_ID}`);
                                    return;
                                }

                                helpers.setFlowStateEntry(LOBBY_WANT_TO_JOIN_ROOM_STATE_KEY, true);
                                helpers.postBotMessages([[_(`Moving you to the room now...`)]]);
                            }
                        },
                        {
                            id: "cancel_enter_room",
                            content: _(`No, go back to home page`),
                            icon: faHomeAlt,
                            onClick: (helpers) => {
                                helpers.goToPage(`/profile`);
                            }
                        },
                    ],
                },
            ]
        } satisfies ChatFlowConfig;
    }, [_, askPermissionQuickReply]);
    const waitingForRoom = useChatFlowState<boolean>({
        flowId: 'permission',
        stateKey: LOBBY_WAITING_FOR_ROOM_STATE_KEY,
    });

    return (
        <>
            <RequestPermissions request={true} />
            {waitingForRoom && (
                <WaitingForRoom />
            )}
            <ChatFlow flow={flow}/>
        </>
    );
}

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
