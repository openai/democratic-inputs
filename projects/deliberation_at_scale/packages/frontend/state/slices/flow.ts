import { Message } from "@/flows/types";
import { createSlice } from "@reduxjs/toolkit";
import { unique } from "radash";

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
            const { flowId, messages: incomingFlowMessages } = action.payload;
            const currentFlowMessages = state.flowMessagesLookup?.[flowId] ?? [];

            // filter out messages where the id of subsequent messages is the same
            // this is a workaround to prevent double messages from being displayed (e.g. with hot reloading)
            const newFlowMessages = [...currentFlowMessages, ...incomingFlowMessages].reduce((acc, message) => {
                const lastMessage = acc[acc.length - 1];

                if (lastMessage?.id === message.id) {
                    return acc;
                }

                return [...acc, message];
            }, [] as Message[]);

            state.flowMessagesLookup[flowId] = newFlowMessages;
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
