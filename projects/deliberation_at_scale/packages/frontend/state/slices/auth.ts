import { createSlice } from "@reduxjs/toolkit";

const initialState = {
};

const slice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        increment: (state) => {
            return state;
        },
    },
});

export default slice;

export const { increment } = slice.actions;
