import { FlowId } from "@/state/slices/flow";
import { useAppSelector } from "@/state/store";

export interface UseChatFlowStateOptions {
    flowId: FlowId;
    stateKey: string;
}

export default function useChatFlowState<T>(options: UseChatFlowStateOptions) {
    const { flowId, stateKey } = options ?? {};
    const flowState = useAppSelector((state) => state.flow.flowStateLookup[flowId] ?? {});
    const flowStateValue = flowState[stateKey];

    return flowStateValue as T;
}
