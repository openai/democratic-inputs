import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { Dayjs } from "dayjs";

import { FlowId, FlowStateEntries } from "@/state/slices/flow";
import { RoomState } from "@/state/slices/room";
import { ReadonlyURLSearchParams } from "next/navigation";

export interface ChatFlowConfig {
    id: FlowId;
    steps: FlowStep[];
    userMessageTemplate?: MessageTemplate;
    botMessageTemplate?: MessageTemplate;
}

export type MessagesOptions = string[][];

export interface FlowStep {
    active?: boolean;
    name: string;
    messageOptions: MessagesOptions | ((helpers: OnInputHelpers) => Promise<MessagesOptions>);
    quickReplies?: QuickReply[];
    skip?: (helpers: OnInputHelpers) => Promise<boolean> | boolean;
    onInput?: (input: UserInput, helpers: OnInputHelpers) => Promise<boolean | void>;
    timeoutMs?: number;
    onTimeout?: (helpers: OnInputHelpers) => Promise<void>;
    hideInput?: boolean;
}

export type PostMessages = (messageOptions: MessagesOptions) => void;

export interface OnInputHelpers {
    goToPage: (path: string) => void;
    goToPrevious: () => void;
    goToNext: () => void;
    goToName: (destination: string) => void;
    postUserMessages: PostMessages;
    postBotMessages: PostMessages;
    waitFor: (timeoutMs: number) => Promise<void>;
    setFlowStateEntry: (key: string, value: any) => void;
    flowStateEntries: FlowStateEntries;
    roomState: RoomState;
    searchParams: ReadonlyURLSearchParams | null;
    params: Record<string, string | string[]> | null;
    isVideoEnabled: boolean;
    isAudioEnabled: boolean;
    reset: () => void;
}

export interface QuickReply {
    id: string;
    icon?: IconProp;
    content: string;
    onClick: (helpers: OnInputHelpers) => void;
    enabled?: (helpers: OnInputHelpers) => boolean;
    hidden?: (helpers: OnInputHelpers) => boolean;
}

export type MessageTemplate = Omit<Message, 'content' | 'id'>;

export interface Message {
    id: string;
    content: string;
    nameId?: string;
    name?: string;
    nameIcon?: IconProp;
    date?: string | Date | Dayjs;
    highlighted?: boolean;
    flagged?: boolean;
    flaggedReason?: string;
}

export interface UserInput {
    id?: string,
    content: string
}
