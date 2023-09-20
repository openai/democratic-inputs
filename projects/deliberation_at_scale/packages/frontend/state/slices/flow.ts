import { createSlice } from "@reduxjs/toolkit";

export type FlowId = "register" | "login" | "profile" | "lobby" | "evaluate";
export type FlowStateEntryValue = any;
export type FlowStateEntries = Record<string, FlowStateEntryValue>;
export type FlowStateLookup = Record<FlowId, FlowStateEntries>;

export interface FlowState {
    flowStateLookup: FlowStateLookup;
}

export interface SetFlowStateAction {
    payload: {
        id: FlowId;
        key: string;
        value: FlowStateEntryValue;
    }
}

export interface ResetFlowStateAction {
    payload: {
        id: FlowId;
        key?: string;
    }
}

const initialState: FlowState = {
    flowStateLookup: {},
};

const slice = createSlice({
    name: 'flow',
    initialState,
    reducers: {
        setFlowStateEntry: (state, action: SetFlowStateAction) => {
            const { id, key, value } = action.payload;

            if (!state.flowStateLookup[id]) {
                state.flowStateLookup[id] = {};
            }

            state.flowStateLookup[id][key] = value;
        },
        resetFlowState: (state, action: ResetFlowStateAction) => {
            const { id, key } = action.payload;

            if (key) {
                delete state.flowStateLookup[id][key];
            } else {
                delete state.flowStateLookup[id];
            }
        },
    },
});

export default slice;

export const { setFlowStateEntry, resetFlowState } = slice.actions;
