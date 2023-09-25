import useChatFlowState from "@/hooks/useChatFlowState";
import useLobby from "@/hooks/useLobby";
import { setFlowStateEntry } from "@/state/slices/flow";
import { LOBBY_FOUND_ROOM_STATE_KEY, LOBBY_WANT_TO_JOIN_ROOM_STATE_KEY } from "@/utilities/constants";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function WaitingForRoom() {
    const { canEnterRoom, enterRoom } = useLobby();
    const dispatch = useDispatch();
    const wantToJoinRoom = useChatFlowState<boolean>({
        flowId: 'permission',
        stateKey: LOBBY_WANT_TO_JOIN_ROOM_STATE_KEY,
    });

    // wait until there is a candidate room
    useEffect(() => {
        if (!canEnterRoom) {
            return;
        }

        dispatch(setFlowStateEntry({
            flowId: 'permission',
            key: LOBBY_FOUND_ROOM_STATE_KEY,
            value: true,
        }));
    }, [canEnterRoom, dispatch]);

    // wait until the user confirmed entering the room
    useEffect(() => {
        if (!wantToJoinRoom || !canEnterRoom) {
            return;
        }

        enterRoom();
    }, [canEnterRoom, enterRoom, wantToJoinRoom]);

    return null;
}
