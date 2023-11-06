import { createSlice } from "@reduxjs/toolkit";
import dayjs from "dayjs";

export type AutoFetchedAtLookup = Record<string, string>;

export interface RoomState {
    autoFetchedAtLookup: AutoFetchedAtLookup
}

export interface UpdateAutoFetchedAtAction {
    payload: {
        autoFetchId: string;
    }
}

const initialState: RoomState = {
    autoFetchedAtLookup: {},
};

const slice = createSlice({
    name: 'room',
    initialState,
    reducers: {
        updateAutoFetchedAt: (state, action: UpdateAutoFetchedAtAction) => {
            const { autoFetchId } = action.payload;
            state.autoFetchedAtLookup[autoFetchId] = dayjs().toISOString();
        },
    },
});

export default slice;

export const { updateAutoFetchedAt } = slice.actions;
