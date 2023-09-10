import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export type RoomId = string | undefined;

export enum RoomStatus {
    SETUP,
    LOBBY,
    GROUP_INTRODUCTION,
    TOPIC_INTRODUCTION,
    DELIBERATION,
    CONSENSUS,
    REFLECTION,
}

export enum PermissionState {
    /** We're currently checking whether permissions have already been given */
    INITIALIZING = 'INITIALIZING',
    /** Sufficient permissions were not given */
    NONE = 'NONE',
    /** Permissions have been requested */
    REQUESTED = 'REQUESTED',
}

export interface RoomState {
  currentRoomId: RoomId;
  permission: PermissionState;
}

const initialState: RoomState = {
    currentRoomId: undefined,
    permission: PermissionState.NONE,
};

const slice = createSlice({
    name: 'room',
    initialState,
    reducers: {
        joinRoom: (state, action: PayloadAction<RoomId>) => {
            state.currentRoomId = action.payload;
        },
        leaveRoom: (state) => {
            state.currentRoomId = undefined;
        },
        setPermissionState(state, action: PayloadAction<PermissionState>) {
            state.permission = action.payload;
        },
    },
});

export default slice;

export const { joinRoom, leaveRoom, setPermissionState } = slice.actions;
