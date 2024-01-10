import type { CronItem } from 'graphile-worker';
import { DISABLE_CRONTAB } from './constants';

interface ToggleableCronItem extends CronItem {
    active: boolean;
}

const crontab: ToggleableCronItem[] = [
    {
        active: true,
        pattern: '* * * * *',
        task: 'reschedule',
        identifier: 'reschedule',
    },
];

export default crontab.filter((cronItem) => cronItem.active && !DISABLE_CRONTAB);
