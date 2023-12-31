"use client";
import useChatFlowState from "@/hooks/useChatFlowState";
import ChatFlow from "./index";
import RequestPermissions from "../LocalMedia/RequestPermissions";
import { ENABLE_ROOM_AUTO_JOIN, ENABLE_TEST_ROOM, LOBBY_ALLOW_ASK_PERMISSION_STATE_KEY, LOBBY_FOUND_ROOM_STATE_KEY, LOBBY_WAITING_FOR_ROOM_STATE_KEY, LOBBY_WANT_TO_JOIN_ROOM_STATE_KEY, ONE_SECOND_MS, TEST_ROOM_ID } from "@/utilities/constants";
import WaitingForRoom from "../RoomConnection/WaitingForRoom";
import { ChatFlowConfig, OnInputHelpers, QuickReply } from "@/types/flows";
import { PermissionState } from "@/state/slices/room";
import { faSearch, faArrowRight, faHomeAlt, faCancel } from "@fortawesome/free-solid-svg-icons";
import { useLingui } from "@lingui/react";
import { isEmpty } from "radash";
import { useEffect, useMemo } from "react";
import { msg } from "@lingui/macro";
import { useDispatch } from "react-redux";
import { resetFlowPosition, setFlowStateEntry } from "@/state/slices/flow";

export default function PermissionChatFlow() {
    const { _ } = useLingui();
    const dispatch = useDispatch();
    const askPermissionQuickReply = useMemo(() => {
        return {
            id: "permission_ask_yes",
            content: _(msg`Check device permissions now`),
            onClick: (helpers) => {
                helpers.setFlowStateEntry(LOBBY_ALLOW_ASK_PERMISSION_STATE_KEY, true);
                helpers.goToName('permission_verify_working');
            },
        } satisfies QuickReply;
    }, [_]);
    const waitingForRoomMessageOptions = useMemo(() => {
        const messages = [
            _(msg`Note: We do not record your video or audio.`),
            _(msg`Tip: Want create a new statement? Just type and send your thoughts into the chat.`),
            _(msg`Note: Our AI is not listening in, it only understands what you type and send in the chat.`),
            _(msg`Tip: We really care about what you care about! Type your thoughts into the chat to share them with us.`),
            _(msg`Note: This may take a few minutes - don't leave the page!`),
            _(msg`Tip: Your vote is important. It will be registered.`),
            _(msg`Note: If you are in **a call with less than three people, the system won't work**. Leave the conversation by clicking the red door next to your video feed and join a new one.`),
            _(msg`Tip: Share your opinions first. Then vote.`),
            _(msg`Tip: Is anything stuck or broken? Try refreshing the page.`),
            _(msg`Tip: Progressing after a conversation? Press 'next statement'.`),
            _(msg`Thank you for participating in this test!`),
            _(msg`Tip: You can actually share what you really think!`),
            _(msg`Tip: Meeting new people can be hard: that's okay! `),
            _(msg`Tip: Found a bug? Tell us in the evaluation form.`),
        ];

        return messages.map((message) => {
            return [message];
        });
    }, [_]);
    const cancelWaitingForRoomQuickReply = useMemo(() => {
        return {
            id: "cancel_waiting_for_room",
            content: _(msg`Leave the queue.`),
            icon: faCancel,
            onClick: async (helpers) => {
                helpers.postBotMessages([[_(msg`Okay, leaving the queue...`)]]);
                await helpers.waitFor(ONE_SECOND_MS);
                helpers.goToPage(`/profile`);
            },
        } satisfies QuickReply;
    }, [_]);
    const flow = useMemo(() => {
        return {
            id: "permission",
            steps: [
                {
                    name: "permission_ask",
                    messageOptions: [[_(msg`You need to give permission to use your camera and microphone. The video feed is not recorded. In this current test your audio will not be transcribed.`)]],
                    timeoutMs: 2000, // keep this fixed to give devices time to initialize
                },
                {
                    name: "permission_verify_working",
                    messageOptions: async () => {
                        return [[_(msg`Everything seems to be working fine. Let's get started!`)]];
                    },
                    skip: (helpers) => {
                        const isRequested = helpers.roomState.permission === PermissionState.REQUESTED;
                        const hasGivenPermission = isRequested && helpers.isVideoEnabled;

                        if (!hasGivenPermission) {
                            helpers.goToName("permission_not_working");
                        }

                        return !hasGivenPermission;
                    },
                    quickReplies: [
                        {
                            id: "find_room",
                            content: _(msg`Start searching for a conversation`),
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
                            content: _(msg`Continue to room`),
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
                    messageOptions: [[_(msg`It appears that you have not enabled the use of your microphone and camera, or they may be disabled. Please click the button below to try again or enable them using the buttons above.`)]],
                    quickReplies: [
                        askPermissionQuickReply,
                    ],
                },
                {
                    name: `waiting_for_room_1`,
                    messageOptions: waitingForRoomMessageOptions,
                    timeoutMs: ONE_SECOND_MS * 5,
                    quickReplies: [
                        cancelWaitingForRoomQuickReply,
                    ],
                    onTimeout: (helpers) => {
                        return waitingForRoomOnTimeout(helpers, 'waiting_for_room_2');
                    },
                },
                {
                    name: `waiting_for_room_2`,
                    messageOptions: [[_(msg`Waiting for two other participants...`)]],
                    timeoutMs: ONE_SECOND_MS * 5,
                    quickReplies: [
                        cancelWaitingForRoomQuickReply,
                    ],
                    onTimeout: (helpers) => {
                        return waitingForRoomOnTimeout(helpers, 'waiting_for_room_1');
                    },
                },
                {
                    name: "ask_to_enter_room", // Bram: Possibly just remove this option -> Participant will be automatically placed in room when one is found. As soon as participant clicks search room, they state to be ready to join one.
                    messageOptions: [[_(msg`Conversation partners have been found. Dive right in!`)]],
                    quickReplies: [
                        {
                            id: "enter_room",
                            content: _(msg`Start the conversation`),
                            icon: faArrowRight,
                            onClick: (helpers) => {
                                if (ENABLE_TEST_ROOM) {
                                    helpers.goToPage(`/room/${TEST_ROOM_ID}`);
                                    return;
                                }

                                helpers.setFlowStateEntry(LOBBY_WANT_TO_JOIN_ROOM_STATE_KEY, true);
                                helpers.postBotMessages([[_(msg`It's happening now! Enjoy!`)]]);
                            }
                        },
                        {
                            id: "cancel_enter_room",
                            content: _(msg`Go back to home`),
                            icon: faHomeAlt,
                            onClick: (helpers) => {
                                helpers.goToPage(`/profile`);
                            }
                        },
                    ],
                },
            ]
        } satisfies ChatFlowConfig;
    }, [_, askPermissionQuickReply, cancelWaitingForRoomQuickReply, waitingForRoomMessageOptions]);
    const waitingForRoom = useChatFlowState<boolean>({
        flowId: 'permission',
        stateKey: LOBBY_WAITING_FOR_ROOM_STATE_KEY,
    });

    // on mount reset the state
    useEffect(() => {
        dispatch(resetFlowPosition({
            flowId: 'permission',
        }));
        dispatch(setFlowStateEntry({
            flowId: 'permission',
            key: LOBBY_WANT_TO_JOIN_ROOM_STATE_KEY,
            value: false,
        }));
        dispatch(setFlowStateEntry({
            flowId: 'permission',
            key: LOBBY_WAITING_FOR_ROOM_STATE_KEY,
            value: false,
        }));
        dispatch(setFlowStateEntry({
            flowId: 'permission',
            key: LOBBY_FOUND_ROOM_STATE_KEY,
            value: false,
        }));
    }, [dispatch]);

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

    // guard: check if auto join is enabled
    if (ENABLE_ROOM_AUTO_JOIN) {
        helpers.setFlowStateEntry(LOBBY_WANT_TO_JOIN_ROOM_STATE_KEY, true);
        return;
    }

    helpers.goToName("ask_to_enter_room");
};
