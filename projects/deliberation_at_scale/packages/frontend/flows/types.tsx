import { ReactNode } from "react";

export interface Flow{
    name: string;
    steps: FlowStep[];
}

export interface FlowStepBase{
    name: string;
    messages: Message | Message[];
    skip?: (helpers: OnInputHelpers) => Promise<boolean> | boolean;
    quickReply?: QuickReply[];
}

export interface OnInputHelpers{
    goToNext: () => void;
    goToName: (destination: string) => void; //navigates to a sub-flow
    postMessage: (message: Message | Message[]) => void;
    // navigation: (flow: string) => void;    //navigates to another page (and thus another flow)
    // chatGPT: (message: Message) => void;   //additional parameters: model, prompt -- pre-moderate?
    // supaBase: typeof supabaseClient;       //mainly to indicate this is an option
    // reduxStore: typeof store;
}

export interface OnInput {
    onInput: (input: UserInput, helpers: OnInputHelpers) => Promise<void>;
    timeout?: never;
}

export interface TimeOut {
    /** time in ms */
    timeout: number;
    onInput?: never;
}

type FlowStep = (FlowStepBase & OnInput) | (FlowStepBase & TimeOut);

export interface QuickReply{
    id: string;
    icon: string;
    message: string;
}

export type Message = string | ReactNode;
export interface UserInput{
    id?: string,
    content: string
}