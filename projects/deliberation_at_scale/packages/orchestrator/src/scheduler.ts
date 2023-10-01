import { Helpers, quickAddJob } from "graphile-worker";
import dayjs from "dayjs";

import { HandleQueuedParticipantsPayload } from "./tasks/handleQueuedParticipants";

export async function startScheduler() {
    // quickAddJob({}, "triggerRoomProgressionUpdates", {}, {
    //     jobKey: "triggerRoomProgressionUpdates",
    // });

    // quickAddJob({}, "handleQueuedParticipants", {
    //     jobKey: "handleQueuedParticipants",
    // } as HandleQueuedParticipantsPayload, {
    //     jobKey: "handleQueuedParticipants",
    // });

    quickAddJob({}, "screencast", {}, {
        jobKey: "screencast",
    });
}

export async function stopScheduler() {
    // empty?
}

export interface RescheduleOptions<T> {
    workerTaskId: string;
    jobKey?: string;
    payload: T;
    intervalMs: number;
    helpers: Helpers;
}

export async function reschedule<T>(options: RescheduleOptions<T>) {
    const { workerTaskId, jobKey, payload, intervalMs, helpers } = options;
    const now = dayjs();
    const runAt = now.add(intervalMs, "ms");

    helpers.logger.info(`Rescheduling ${workerTaskId} to run at ${runAt.toISOString()}...`);
    quickAddJob({}, workerTaskId, payload, {
        runAt: runAt.toDate(),
        jobKey,
        jobKeyMode: "replace",
    });
}
