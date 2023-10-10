import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Session, User } from "@supabase/supabase-js";

const initialState = {
    authUser: null as User | null,
    authSession: null as Session | null,
};

const slice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        setAuthUser: (state, action: PayloadAction<User | null>) => {
            state.authUser = action.payload;
        },
        setAuthSession: (state, action: PayloadAction<Session | null>) => {
            state.authSession = action.payload;
        },
    },
});

export default slice;

export const { setAuthUser, setAuthSession } = slice.actions;
