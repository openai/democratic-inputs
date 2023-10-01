import { QuickReply } from "./types";
import { t } from '@lingui/macro';
import { faRotate } from '@fortawesome/free-solid-svg-icons';

export const resetQuickReply: QuickReply = {
    id: 'start-over',
    content: t`Start over`,
    icon: faRotate,
    onClick(helpers) {
        helpers.reset?.();
    },
};
