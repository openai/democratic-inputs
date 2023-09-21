import { FlowId } from "@/state/slices/flow";
import { useAppSelector } from "@/state/store";

export interface UseChatFlowMessagesOptions {
    flowId: FlowId;
}

export default function useChatFlowMessages(options: UseChatFlowMessagesOptions) {
    const { flowId } = options;
    const flowMessages = useAppSelector((state) => state.flow.flowMessagesLookup?.[flowId]);

    return {
        flowMessages,
    };
}
