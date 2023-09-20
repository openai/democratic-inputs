"use client";
import useChatFlowState from "@/hooks/useChatFlowState";
import ChatFlow from "./index";
import lobbyFlow from "@/flows/lobbyFlow";
import RequestPermissions from "../LocalMedia/RequestPermissions";
import { LOBBY_ALLOW_ASK_PERMISSION_STATE_KEY, LOBBY_WAITING_FOR_ROOM_STATE_KEY } from "@/utilities/constants";
import WaitingForRoom from "../RoomConnection/WaitingForRoom";

export default function LobbyChatFlow() {
    const allowAskPermission = useChatFlowState<boolean>({
        flowId: 'lobby',
        stateKey: LOBBY_ALLOW_ASK_PERMISSION_STATE_KEY,
    });
    const waitingForRoom = useChatFlowState<boolean>({
        flowId: 'lobby',
        stateKey: LOBBY_WAITING_FOR_ROOM_STATE_KEY,
    });

    return (
        <>
            {allowAskPermission && (
                <RequestPermissions />
            )}
            {waitingForRoom && (
                <WaitingForRoom />
            )}
            <ChatFlow flow={lobbyFlow}/>
        </>
    );
}
