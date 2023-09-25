import { quickAddJob } from "graphile-worker";
import { REALTIME_POSTGRES_CHANGES_LISTEN_EVENT, RealtimeChannel, RealtimePostgresChangesFilter, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

import { supabaseClient, Message } from "./lib/supabase";
import objectHash from "object-hash";
import { BaseMessageWorkerTaskPayload, WorkerTaskId } from "./types";

const listeners: RealtimeChannel[] = [];

export async function startListener() {
    await startMessageListener();
}

export async function stopListener() {
    await Promise.allSettled(listeners.map((listener) => {
        return listener.unsubscribe();
    }));
}

async function startMessageListener() {

    // listen for new message inserts
    registerRealtimeListener({
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: "type=in.(chat, voice)",
    }, (payload) => {
        const newMessage = payload.new as Message;
        const { id, room_id: roomId } = newMessage;
        const jobKeyPostfix = `message-${id}`;
        const workerTasks: Array<{ taskId: WorkerTaskId, maxAttempts: number }> = [
            { taskId: 'verifySafeMessage', maxAttempts: 10 },
            { taskId: 'verifyEasyMessage', maxAttempts: 1 },
        ];

        // guard: skip invalid message
        if (!roomId) {
            return;
        }

        workerTasks.map((workerTask) => {
            const { taskId: workerTaskId, maxAttempts } = workerTask;
            const jobKey = `${workerTaskId}-${jobKeyPostfix}`;
            const jobPayload: BaseMessageWorkerTaskPayload = {
                message: newMessage,
                roomId,
                jobKey,
            };

            quickAddJob({}, workerTaskId, jobPayload, {
                jobKey,
                maxAttempts,
            });
        });
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function registerRealtimeListener<T extends `${REALTIME_POSTGRES_CHANGES_LISTEN_EVENT}`, K extends { [key: string]: any }>(filter: RealtimePostgresChangesFilter<T>, callback: (payload: RealtimePostgresChangesPayload<K>) => void) {
    const channelName = objectHash(filter);

    const listener = supabaseClient
        .channel(channelName)
        .on(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            "postgres_changes",
            filter,
            callback,
        )
        .subscribe();

    listeners.push(listener);
}
