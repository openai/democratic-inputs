import { Job, WorkerEventMap } from "graphile-worker";
import { ONE_SECOND_MS } from "../constants";
import { getRunner } from "../runner";

export interface CompletionWaitOptions {
    jobId: string;
    timeoutMs?: number;
}

export interface AllCompletionsWaitOptions {
    jobIds: string[];
    timeoutMs?: number;
}

export async function waitForAllJobCompletions(options: AllCompletionsWaitOptions) {
    const { jobIds, timeoutMs } = options;

    return Promise.allSettled(jobIds.map((jobId) => {
        return waitForSingleJobCompletion({
            jobId,
            timeoutMs,
        });
    }));
}

export async function waitForSingleJobCompletion(options: CompletionWaitOptions): Promise<Job | null> {
    const { jobId, timeoutMs = 5 * 60 * ONE_SECOND_MS } = options;
    const runner = getRunner();

    // guard: ensure the runner is valid
    if (!runner) {
        return null;
    }

    return new Promise((resolve, reject) => {
        const jobCompletionCallback = ({ job }: WorkerEventMap["job:complete"]) => {
            const candidateJobId = job.id;

            // guard: check if this is the job we're waiting on
            if (jobId !== candidateJobId) {
                return;
            }

            // cancel timeout
            clearTimeout(completionTimeout);

            // unregister itself
            unregisterCompletionCallback();

            // job has completed without timeout
            resolve(job);
        };
        const unregisterCompletionCallback = () => {
            runner.events.off("job:complete", jobCompletionCallback);
        };
        const completionTimeout = setTimeout(() => {
            unregisterCompletionCallback();
            reject(`The job waiting time has reached the maximum timeout of ${timeoutMs}`);
        }, timeoutMs);

        // register the event
        runner.events.on("job:complete", jobCompletionCallback);
    });
}
