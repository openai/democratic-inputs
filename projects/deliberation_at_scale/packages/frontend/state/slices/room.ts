import { createSlice } from "@reduxjs/toolkit";

export type RoomId = string | null;

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
    currentRoomId: null,
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
