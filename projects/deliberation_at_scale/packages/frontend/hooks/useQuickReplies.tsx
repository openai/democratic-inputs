import { QuickReply } from "../types/flows";
import { faRotate } from '@fortawesome/free-solid-svg-icons';
import { useMemo } from "react";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/macro";

export default function useQuickReplies() {
    const { _ } = useLingui();
    const resetQuickReply = useMemo(() => {
        return {
            id: 'start-over',
            content: _(msg`Start over`),
            icon: faRotate,
            onClick(helpers) {
                helpers.reset?.();
            },
        } satisfies QuickReply;
    }, [_]);

    return {
        resetQuickReply,
    };
}
