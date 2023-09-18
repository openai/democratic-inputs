import { quickAddJob } from "graphile-worker";

export async function startScheduler() {
    quickAddJob({}, "triggerRoomProgressionUpdates", {}, {
        jobKey: "triggerRoomProgressionUpdates",
        jobKeyMode: "preserve_run_at",
    });

    // TMP: for testing
    // quickAddJob({}, "verifyEasyLanguage", 0, {
    //     jobKey: "difficultLanguage",
    //     jobKeyMode: "preserve_run_at",
    // });
}

export async function stopScheduler() {

}
