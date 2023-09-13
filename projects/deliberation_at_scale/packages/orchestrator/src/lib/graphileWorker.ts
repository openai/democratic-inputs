import { Job, WorkerEventMap } from "graphile-worker";
import { ONE_SECOND_MS } from "src/contants";
import { getRunner } from "src/runner";

export interface CompletionWaitOptions {
    jobId: string;
    timeoutMs?: number;
}

export interface AllCompletionsWaitOptions {
    completions: CompletionWaitOptions[];
}

export async function waitForAllJobCompletions(options: AllCompletionsWaitOptions) {
    const { completions } = options;

    return Promise.allSettled(completions.map((completion) => {
        return waitForSingleJobCompletion(completion);
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
