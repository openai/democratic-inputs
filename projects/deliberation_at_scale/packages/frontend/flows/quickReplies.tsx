import { faArrowAltCircleDown } from '@fortawesome/free-regular-svg-icons';
import { QuickReply } from "./types";
import { t } from '@lingui/macro';

export const resetQuickReply: QuickReply = {
    content: t`Start Over`,
    id: 'start-over',
    icon: faArrowAltCircleDown,
    onClick(helpers) {
        helpers.reset?.();
    },
};
