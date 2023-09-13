import { quickAddJob } from "graphile-worker";
import supabase from "./lib/supabase";
import objectHash from "object-hash";
import { REALTIME_POSTGRES_CHANGES_LISTEN_EVENT, RealtimeChannel, RealtimePostgresChangesFilter, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

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
        const newMessage = payload.new;

        // add logic for supabase triggers.
        // for every message from supabase, quickAdd job the moderation task with the message as payload
        quickAddJob({}, "badLanguage", newMessage, {
            jobKey: "badLanguage",
            jobKeyMode: "preserve_run_at",
        });
        quickAddJob({}, "difficultLanguage", newMessage, {
            jobKey: "difficultLanguage",
            jobKeyMode: "preserve_run_at",
        });
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function registerRealtimeListener<T extends `${REALTIME_POSTGRES_CHANGES_LISTEN_EVENT}`, K extends { [key: string]: any }>(filter: RealtimePostgresChangesFilter<T>, callback: (payload: RealtimePostgresChangesPayload<K>) => void) {
    const channelName = objectHash(filter);

    const listener = supabase
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
