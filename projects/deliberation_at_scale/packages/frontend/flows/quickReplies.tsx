import { QuickReply } from "./types";
import { t } from '@lingui/macro';
import { faRotate } from '@fortawesome/free-solid-svg-icons';

export const resetQuickReply: QuickReply = {
    content: t`Start over`,
    id: 'start-over',
    icon: faRotate,
    onClick(helpers) {
        helpers.reset?.();
    },
};
