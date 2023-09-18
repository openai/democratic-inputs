import { quickAddJob } from "graphile-worker";

export async function startScheduler() {
    quickAddJob({}, "triggerRoomProgressionUpdates", {}, {
        jobKey: "triggerRoomProgressionUpdates",
        jobKeyMode: "preserve_run_at",
    });
    quickAddJob({}, "lobby", 0, {
        jobKey: "lobby",
        jobKeyMode: "preserve_run_at",
    });
    // add logic for supabase triggers.
    // for every message from supabase, quickAdd job the moderation task with the message as payload

    // TMP: for testing
    // quickAddJob({}, "verifyEasyLanguage", 0, {
    //     jobKey: "difficultLanguage",
    //     jobKeyMode: "preserve_run_at",
    // });
}

export async function stopScheduler() {

}
