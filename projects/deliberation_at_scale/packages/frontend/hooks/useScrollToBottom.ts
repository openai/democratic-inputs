import { MESSAGES_SCROLL_CONTAINER_ID } from "@/utilities/constants";
import { useCallback, useEffect } from "react";

export interface UseScrollToBottomOptions {
    behavior?: ScrollBehavior;
    data?: any;
}

export default function useScrollToBottom(options: UseScrollToBottomOptions) {
    const { behavior = 'smooth', data } = options;
    const scrollToBottom = useCallback((overrideBehavior?: ScrollBehavior) => {
        const messagesScrollContainer = document.getElementById(MESSAGES_SCROLL_CONTAINER_ID);

        // now scroll the main container to the bottom smoothly
        if (!messagesScrollContainer) {
            return;
        }

        messagesScrollContainer.scrollTo({
            top: messagesScrollContainer.scrollHeight,
            behavior: overrideBehavior ?? behavior,
        });
    }, [behavior]);

    useEffect(() => {
        scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(data), scrollToBottom]);

    return {
        scrollToBottom,
    };
}
