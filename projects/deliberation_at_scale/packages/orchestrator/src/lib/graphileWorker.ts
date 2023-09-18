import { Job, WorkerEventMap } from "graphile-worker";
import { createClient } from '@supabase/supabase-js';

import { SUPABASE_URL, SUPABASE_KEY, ONE_SECOND_MS } from "../config/constants";
import { Database } from 'src/generated/database-graphile_worker.types';
import { getRunner } from "../runner";
import { Moderation, supabaseClient } from "./supabase";

export interface CompletionWaitOptions {
    jobId: string;
    timeoutMs?: number;
}

export interface AllCompletionsWaitOptions {
    jobIds: string[];
    timeoutMs?: number;
}

export const graphileWorkerClient = createClient<Database>(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
        db: {
            schema: 'graphile_worker',
        },
        auth: {
            persistSession: false,
        }
    }
);

export async function getJobByKey(jobKey: string) {
    const jobResult = await graphileWorkerClient.from('jobs').select().eq('job_key', jobKey).single();
    const job = jobResult?.data;

    return job;
}

export type ModerationCompletionTuple = {
    job: Job;
    moderation: Moderation;
}

export async function waitForAllModerationCompletions(options: AllCompletionsWaitOptions) {
    const { jobIds, timeoutMs } = options;

    return Promise.allSettled(jobIds.map((jobId) => {
        return new Promise<ModerationCompletionTuple>((resolve, reject) => {
            waitForSingleJobCompletion({
                jobId,
                timeoutMs,
            }).then((job) => {
                const { key: jobKey, run_at: jobRunnedAt } = job ?? {};

                if (!job || !jobKey || !jobRunnedAt) {
                    reject(`No job key or run at found for job ${jobId}`);
                    return;
                }

                supabaseClient.from("moderations")
                    .select()
                    .eq("job_key", jobKey)
                    .gt("completed_at", jobRunnedAt)
                    .single()
                    .then((result) => {
                        const { data: moderation, error } = result;
                        const isValidModeration = !!moderation;

                        // guard: check for error
                        if (error) {
                            reject(error);
                            return;
                        }

                        // guard: check if a moderation was found
                        if (!isValidModeration) {
                            reject(`No completed moderation found for job key ${jobKey}`);
                            return;
                        }

                        resolve({
                            job,
                            moderation,
                        });
                    });
            }).catch((error) => {
                reject(error);
            });
        });
    }));
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
