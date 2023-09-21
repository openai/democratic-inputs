"use client";
import useChatFlowState from "@/hooks/useChatFlowState";
import ChatFlow from "./index";
import permissionFlow from "@/flows/permissionFlow";
import RequestPermissions from "../LocalMedia/RequestPermissions";
import { LOBBY_WAITING_FOR_ROOM_STATE_KEY } from "@/utilities/constants";
import WaitingForRoom from "../RoomConnection/WaitingForRoom";

export default function PermissionChatFlow() {
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
            <ChatFlow flow={permissionFlow}/>
        </>
    );
}
