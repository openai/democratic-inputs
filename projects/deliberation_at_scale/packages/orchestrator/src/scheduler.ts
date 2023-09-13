import { quickAddJob } from "graphile-worker";

export async function startScheduler() {
    quickAddJob({}, "consensusForming", 0, {
        jobKey: "consensusForming",
        jobKeyMode: "preserve_run_at",
    });
}

export async function stopScheduler() {

}
