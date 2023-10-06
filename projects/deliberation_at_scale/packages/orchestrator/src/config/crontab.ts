import type { CronItem } from 'graphile-worker';
import { DISABLE_CRONTAB } from './constants';

interface ToggleableCronItem extends CronItem {
    active: boolean;
}

const crontab: ToggleableCronItem[] = [
    {
        active: false,
        pattern: '* * * * *',
        task: 'triggerRoomProgressionUpdates',
        identifier: 'triggerRoomProgressionUpdates',
    },
    {
        active: false,
        pattern: '* * * * *',
        task: 'handleQueuedParticipants',
        identifier: 'handleQueuedParticipants',
    },
];

export default crontab.filter((cronItem) => cronItem.active && !DISABLE_CRONTAB);
