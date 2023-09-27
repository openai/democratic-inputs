import { ONE_SECOND_MS } from "@/utilities/constants";
import { useCallback, useEffect } from "react";

export interface UseScrollToBottomOptions {
    behavior?: ScrollBehavior;
    data?: any;
}

export default function useScrollToBottom(options: UseScrollToBottomOptions) {
    const { behavior = 'smooth', data } = options;
    const scrollToBottom = useCallback((overrideBehavior?: ScrollBehavior) => {
        const mainScrollContainer = document.getElementById('main-scroll-container');

        // now scroll the main container to the bottom smoothly
        mainScrollContainer?.scrollTo({
            top: mainScrollContainer.scrollHeight,
            behavior: overrideBehavior ?? behavior,
        });
    }, [behavior]);

    useEffect(() => {
        setTimeout(() => {
            scrollToBottom();
        }, ONE_SECOND_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(data), scrollToBottom]);

    return {
        scrollToBottom,
    };
}
