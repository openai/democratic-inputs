import { QuickReply } from "./types";
import { t } from '@lingui/macro';

export const resetQuickReply: QuickReply = {
    content: t`Start Over`,
    id: 'start-over',
    onClick(helpers) {
        helpers.reset?.();
    },
};
