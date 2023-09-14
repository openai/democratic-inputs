import { quickAddJob } from "graphile-worker";

export async function startScheduler() {
    quickAddJob({}, "scheduleRoomProgressionUpdates", 0, {
        jobKey: "scheduleRoomProgressionUpdates",
        jobKeyMode: "preserve_run_at",
    });

    // TMP: for testing
    quickAddJob({}, "difficultLanguage", 0, {
        jobKey: "difficultLanguage",
        jobKeyMode: "preserve_run_at",
    });
    quickAddJob({}, "equalParticipation_2", 0, {
        jobKey: "equalParticipation_2",
        jobKeyMode: "preserve_run_at",
    });
}

export async function stopScheduler() {

}
