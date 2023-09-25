import { FlowId, FlowStateEntries } from "@/state/slices/flow";
import { useAppSelector } from "@/state/store";

export interface UseChatFlowStateOptions {
    flowId: FlowId;
    stateKey: string;
}

const defaultFlowState: FlowStateEntries = {};

export default function useChatFlowState<T>(options: UseChatFlowStateOptions) {
    const { flowId, stateKey } = options ?? {};
    const flowState = useAppSelector((state) => state.flow.flowStateLookup[flowId] ?? defaultFlowState);
    const flowStateValue = flowState[stateKey];

    return flowStateValue as T;
}
