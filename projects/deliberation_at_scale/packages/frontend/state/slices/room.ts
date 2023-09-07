import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export type RoomId = string | null;

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
    currentRoomId: null,
    permission: PermissionState.NONE,
};

const slice = createSlice({
    name: 'room',
    initialState,
    reducers: {
        joinRoom: (state, action: PayloadAction<string>) => {
            state.currentRoomId = action.payload;
        },
        leaveRoom: (state) => {
            state.currentRoomId = null;
        },
        setPermissionState(state, action: PayloadAction<PermissionState>) {
            state.permission = action.payload;
        },
    },
});

export default slice;

export const { joinRoom, leaveRoom, setPermissionState } = slice.actions;
