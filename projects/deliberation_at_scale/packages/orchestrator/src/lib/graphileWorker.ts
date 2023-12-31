import { Job, WorkerEventMap } from "graphile-worker";
import { createClient } from '@supabase/supabase-js';
import dayjs from "dayjs";

import { SUPABASE_URL, SUPABASE_KEY, ONE_SECOND_MS } from "../config/constants";
import { Database } from '../generated/database-graphile_worker.types';
import { getRunner, getRunnerUtils } from "../runner";
import { Moderation, supabaseClient } from "./supabase";

export interface CompletionWaitOptions {
    job: Job;
    timeoutMs?: number;
}

export interface AllCompletionsWaitOptions {
    jobs: Job[];
    timeoutMs?: number;
}

// TODO: fix permissions for performing the queries below
export const graphileWorkerClient = createClient<Database>(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
        db: {
            schema: 'graphile_worker',
        },
    }
);

export async function getJobByKey(jobKey: string) {
    const jobsResult = await graphileWorkerClient
        .from('jobs')
        .select()
        .eq('key', jobKey)
        .limit(1);
    const job = jobsResult?.data?.[0];

    return job;
}

export async function getLockedJobs() {
    const jobsResult = await graphileWorkerClient
        .from('jobs')
        .select()
        .not('locked_at', 'is', null)
        .not('locked_by', 'is', null);
    const jobs = jobsResult?.data ?? [];

    return jobs;
}

export async function getJobs() {
    const jobsResult = await graphileWorkerClient
        .from('jobs')
        .select();
    const jobs = jobsResult?.data ?? [];

    return jobs;
}

export type ModerationCompletionTuple = {
    job: Job;
    moderation: Moderation;
}

export async function waitForAllModerationCompletions(options: AllCompletionsWaitOptions) {
    const { jobs, timeoutMs } = options;

    return Promise.allSettled(jobs.map((job) => {
        const jobId = job.id;

        return new Promise<ModerationCompletionTuple>((resolve, reject) => {
            waitForSingleJobCompletion({
                job,
                timeoutMs,
            }).then((job) => {
                const { key: jobKey, run_at: runAt } = job ?? {};
                const jobRunnedAt = dayjs(runAt).toISOString();

                if (!job || !jobKey || !runAt) {
                    reject(`No job key or run at found for job ${jobId}`);
                    return;
                }

                supabaseClient.from("moderations")
                    .select()
                    .eq('active', true)
                    .eq("job_key", jobKey)
                    .gt("completed_at", jobRunnedAt)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .then((result) => {
                        const { data: moderations, error } = result;
                        const moderation = moderations?.[0];
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

export async function waitForSingleJobCompletion(options: CompletionWaitOptions): Promise<Job | null> {
    const { job, timeoutMs = 2 * 60 * ONE_SECOND_MS } = options;
    const { id: jobId, key: jobKey } = job ?? {};
    const runner = getRunner();
    const runnerUtils = getRunnerUtils();

    // guard: ensure the runner is valid
    if (!runner || !runnerUtils || !job) {
        return null;
    }

    return new Promise((resolve, reject) => {
        const jobCompletionCallback = ({ job }: WorkerEventMap["job:complete"]) => {
            const candidateJobId = job.id;

            // guard: check if this is the job we're waiting on
            if (jobId !== candidateJobId) {
                return;
            }

            runnerUtils.logger.info(`Completion event of job ${jobKey} (ID: ${jobId}) detected!`);

            // cancel timeout
            clearTimeout(completionTimeout);
            clearInterval(waitingMessageInterval);

            // unregister itself
            unregisterCompletionCallback();

            // job has completed without timeout
            resolve(job);
        };
        const unregisterCompletionCallback = () => {
            runner.events.off("job:complete", jobCompletionCallback);
        };
        const completionTimeout = setTimeout(() => {
            const runnerUtils = getRunnerUtils();

            // permanently fail the job on the timeout
            runnerUtils?.permanentlyFailJobs([jobId]);
            unregisterCompletionCallback();
            reject(`The job ${jobKey} (ID: ${jobId}) waiting time has reached the maximum timeout of ${timeoutMs}`);
        }, timeoutMs);
        const waitingMessageInterval = setInterval(() => {
            runnerUtils.logger.info(`Still waiting on job ${jobKey} (ID: ${jobId}) to complete...`);
        }, ONE_SECOND_MS * 3);

        // register the event
        runner.events.on("job:complete", jobCompletionCallback);
    });
}
