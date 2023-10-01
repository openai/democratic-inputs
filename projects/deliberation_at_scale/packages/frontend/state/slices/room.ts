import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import dayjs from "dayjs";

export type RoomId = string | undefined;

export enum PermissionState {
    /** We're currently checking whether permissions have already been given */
    INITIALIZING = 'INITIALIZING',
    /** Sufficient permissions were not given */
    NONE = 'NONE',
    /** Permissions have been requested */
    REQUESTED = 'REQUESTED',
}

export interface RoomState {
    permission: PermissionState;
    lastOpenedChatAt: string | null;
    lastOpenedAssistantAt: string | null;
}

const initialState: RoomState = {
    permission: PermissionState.NONE,
    lastOpenedChatAt: null,
    lastOpenedAssistantAt: null,
};

const slice = createSlice({
    name: 'room',
    initialState,
    reducers: {
        openRoomChat(state) {
            state.lastOpenedChatAt = dayjs().toISOString();
        },
        openRoomAssistant(state) {
            state.lastOpenedAssistantAt = dayjs().toISOString();
        },
        setPermissionState(state, action: PayloadAction<PermissionState>) {
            state.permission = action.payload;
        },
    },
});

export default slice;

export const { openRoomChat, openRoomAssistant, setPermissionState } = slice.actions;
