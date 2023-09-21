import { Message } from "@/flows/types";
import { createSlice } from "@reduxjs/toolkit";

type PartialRecord<K extends keyof any, T> =  Partial<Record<K, T>>;
export type FlowId = "register" | "login" | "profile" | "lobby" | "permission" | "evaluate";
export type FlowStateEntryValue = any;
export type FlowStateEntries = Record<string, FlowStateEntryValue>;
export type FlowStateLookup = PartialRecord<FlowId, FlowStateEntries>;
export type FlowMessagesLookup = PartialRecord<FlowId, Message[]>;
export type FlowPositionLookup = PartialRecord<FlowId, number>;

export interface FlowState {
    flowPositionLookup: FlowPositionLookup;
    flowMessagesLookup: FlowMessagesLookup;
    flowStateLookup: FlowStateLookup;
}

export interface SetFlowPositionAction {
    payload: {
        flowId: FlowId;
        deltaPosition: number;
        maxPosition: number;
    }
}

export interface ResetFlowPositionAction {
    payload: {
        flowId: FlowId;
    }
}

export interface AddFlowMessagesAction {
    payload: {
        flowId: FlowId;
        messages: Message[];
    }
}

export interface ResetFlowMessagesAction {
    payload: {
        flowId: FlowId;
    }
}

export interface SetFlowStateAction {
    payload: {
        flowId: FlowId;
        key: string;
        value: FlowStateEntryValue;
    }
}

export interface ResetFlowStateAction {
    payload: {
        flowId: FlowId;
        key?: string;
    }
}

const initialState: FlowState = {
    flowPositionLookup: {},
    flowMessagesLookup: {},
    flowStateLookup: {},
};

const slice = createSlice({
    name: 'flow',
    initialState,
    reducers: {
        setFlowPosition: (state, action: SetFlowPositionAction) => {
            const { flowId, deltaPosition, maxPosition } = action.payload;
            const currentPosition = state.flowPositionLookup[flowId] ?? 0;
            const newPosition = currentPosition + deltaPosition;

            // guard: check that the new position is not out of bounds
            if (newPosition < 0 || newPosition > maxPosition) {
                return;
            }

            state.flowPositionLookup[flowId] = newPosition;
        },
        resetFlowPosition: (state, action: ResetFlowPositionAction) => {
            const { flowId } = action.payload;
            delete state.flowPositionLookup[flowId];
        },
        addFlowMessages: (state, action: AddFlowMessagesAction) => {
            const { flowId, messages } = action.payload;
            const flowMessages = state.flowMessagesLookup?.[flowId];

            if (!flowMessages) {
                state.flowMessagesLookup[flowId] = messages;
                return;
            }

            state.flowMessagesLookup[flowId] = [
                ...flowMessages,
                ...messages,
            ];
        },
        resetFlowMessages: (state, action: ResetFlowMessagesAction) => {
            const { flowId } = action.payload;
            delete state.flowMessagesLookup[flowId];
        },
        setFlowStateEntry: (state, action: SetFlowStateAction) => {
            const { flowId, key, value } = action.payload;
            const flowState = state.flowStateLookup[flowId];

            if (!flowState) {
                state.flowStateLookup[flowId] = {
                    [key]: value,
                };
                return;
            }

            flowState[key] = value;
        },
        resetFlowState: (state, action: ResetFlowStateAction) => {
            const { flowId, key } = action.payload;
            const flowState = state.flowStateLookup[flowId];

            if (flowState && key) {
                delete flowState[key];
            } else {
                delete state.flowStateLookup[flowId];
            }
        },
    },
});

export default slice;

export const { setFlowPosition, resetFlowPosition, addFlowMessages, resetFlowMessages, setFlowStateEntry, resetFlowState } = slice.actions;