import type { CronItem } from 'graphile-worker';

const crontab: CronItem[] = [
    {
        pattern: '* * * * *',
        task: 'scheduleRoomProgressionUpdates',
        identifier: 'scheduleRoomProgressionUpdates',
    },
];

export default crontab;
