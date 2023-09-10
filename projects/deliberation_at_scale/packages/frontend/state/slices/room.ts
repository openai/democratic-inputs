import { createSlice } from "@reduxjs/toolkit";

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

export interface RoomState {
  currentRoomId: RoomId;
}

export interface JoinRoomAction {
  type: string;
  payload: {
    roomId: string;
  };
}

const initialState: RoomState = {
    currentRoomId: undefined,
};

const slice = createSlice({
    name: 'room',
    initialState,
    reducers: {
        joinRoom: (state, action: JoinRoomAction) => {
            const { roomId } = action.payload;

            return {
                ...state,
                currentRoomId: roomId,
            };
        },
    },
});

export default slice;

export const { joinRoom } = slice.actions;
