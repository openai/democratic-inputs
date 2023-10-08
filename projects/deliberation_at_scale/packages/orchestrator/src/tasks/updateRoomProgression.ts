import { Helpers, Job } from "graphile-worker";
import { flat, isEmpty, isObject } from "radash";
import dayjs from "dayjs";

// TODO: make mechanism to automatically switch between different topologies
import { progressionTopology } from "../config/test-0-topology";
import { supabaseClient, Moderation } from "../lib/supabase";
import { waitForAllModerationCompletions } from "../lib/graphileWorker";
import { BaseProgressionWorkerTaskPayload, EnrichmentExecutionType, ProgressionEnrichmentTask, ProgressionLayer, ProgressionLayerId, ProgressionTask, RoomStatus } from "../types";
import { Database } from "../generated/database-public.types";
import { VerificationFunctionCompletionResult } from "../lib/openai";
import { ENABLE_ROOM_PROGRESSION, PRINT_ROOM_PROGRESSION, ROOM_PROGRESSION_WITH_JOBS } from "../config/constants";
import { getMessagesAfter, sendBotMessage } from "../utilities/messages";
import { getCompletedModerationsByJobKey, getLastCompletedModerationByJobKey, getModerationsByJobKey } from "../utilities/moderations";
import { getRoomById, updateRoomStatus } from "../utilities/rooms";
import { ModeratorTaskTuple } from "../utilities/tasks";
import { progressionTaskExecutorLookup } from "../utilities/progression";

export interface UpdateRoomProgressionPayload {
    roomId: string;
    jobKey: string;
}

/**
 * This task determines whether a single room can progress to a new phase in the deliberation.
 * A configurable topology of a succesful deliberation is used as a reference to determine all the steps.
 */
export default async function updateRoomProgression(payload: UpdateRoomProgressionPayload, helpers: Helpers) {
    const { roomId, jobKey } = payload;
    const room = await getRoomById(roomId);

    // guard: check if the room is valid
    if (!roomId || !room) {
        return Promise.reject(`Could not update progression because the room was not found. Room ID: ${roomId}`);
    }

    const currentRoomStatus: RoomStatus = room?.status_type ?? 'safe';
    const currentLayerIndex = progressionTopology.layers.findIndex((topologyLayer) => {
        return topologyLayer.roomStatus === currentRoomStatus;
    }) ?? 0;
    const currentLayer = progressionTopology?.layers?.[currentLayerIndex];

    // guard: make sure the layer is valid
    if (!currentLayer) {
        return Promise.reject(`Could not update progression topology layer could not be found. Room ID: ${roomId}, room status: ${currentRoomStatus}.`);
    }

    const currentLayerId = currentLayer.id;
    const currentEnrichments = currentLayer?.enrichments ?? [];
    const progressionTaskBaseContext: ProgressionTasksBaseContext = {
        progressionLayerId: currentLayerId,
        roomId,
        helpers,
    };

    helpers.logger.info(`Running update progression task for room ${roomId} in progression layer ${currentLayerId}.`);

    // trigger the enrichments that should be triggered before verification
    await triggerEnrichments({
        enrichments: currentEnrichments,
        progressionTaskBaseContext,
        executionTypes: ['alwaysBeforeVerification'],
        helpers,
    });

    const verificationResult = await triggerVerifications({
        currentLayer,
        currentLayerIndex,
        helpers,
        progressionTaskBaseContext,
    });

    if (!verificationResult) {
        helpers.logger.info(`Not all progression verifications passed for room ${roomId} for unknown reasons.`);
        return;
    }

    const { failedProgressionTaskIds: currentFailedProgressionTaskIds } = verificationResult;
    const failedVerificationTaskIds = [...currentFailedProgressionTaskIds];
    const hasFailedVerifications = failedVerificationTaskIds.length > 0;

    // guard: if one verification has failed we cannot proceed to the next progression
    if (hasFailedVerifications) {
        helpers.logger.info(`Not all progression verifications passed for room ${roomId}: ${JSON.stringify(failedVerificationTaskIds)}.`);

        // trigger the enrichments that should be triggered when verification failed
        await triggerEnrichments({
            enrichments: currentEnrichments,
            progressionTaskBaseContext,
            executionTypes: ['onNotVerified', 'alwaysAfterVerification'],
            helpers,
        });
        return;
    }

    helpers.logger.info(`All verifications passed for ${roomId} in progression layer ${currentLayerId}!`);

    const nextLayer = progressionTopology.layers?.[currentLayerIndex + 1];

    // trigger the enrichments that should be triggered when verification passed
    // NOTE: this is done before a room update progression, because changing the status
    // impacts the execution and filtering of the enrichments
    await triggerEnrichments({
        enrichments: currentEnrichments,
        progressionTaskBaseContext,
        executionTypes: ['onVerified', 'alwaysAfterVerification'],
        helpers,
    });

    // guard: check if there is a next layer
    if (!nextLayer) {
        return;
    }

    const hasFailedMinAttemptTasks = await checkTasksForMinAttempts({
        roomId,
        layer: currentLayer,
        helpers,
    });

    // guard: skip when not all tasks were done a minimum amount of times
    if (hasFailedMinAttemptTasks) {
        helpers.logger.info(`Not all progression tasks in layer ${currentLayerId} were done a minimum amount of times ${roomId}!`);
        return;
    }

    const nextLayerId = nextLayer.id;
    helpers.logger.info(`The next progression layer is ${nextLayerId} for room ${roomId}.`);

    // progress to the new status
    if (ENABLE_ROOM_PROGRESSION) {
        const roomProgressionJobKey = getModerationJobKeyForRoomProgression(roomId, nextLayerId);
        await Promise.allSettled([
            supabaseClient.from("moderations").insert({
                type: 'updateRoomProgression',
                job_key: roomProgressionJobKey,
                statement: `The room progressed from ${currentLayerId} to the next layer ${nextLayerId}`,
                target_type: 'room',
                room_id: roomId,
                result: JSON.stringify({
                    currentLayerId,
                    nextLayerId,
                }),
                completed_at: dayjs().toISOString(),
            }),
            updateRoomStatus({
                roomId,
                roomStatus: nextLayer.roomStatus,
                helpers,
            }),
            helpers.addJob("updateRoomProgression", payload, {
                jobKey,
            }),
            PRINT_ROOM_PROGRESSION && sendBotMessage({
                roomId,
                content: `[DEBUG] The room progressed from ${currentLayerId} to the next layer ${nextLayerId}`,
            })
        ]);
    } else {
        helpers.logger.info('Skipping progression, because we are in testing mode.');
    }
}

interface CheckTasksForMinAttemptsOptions {
    roomId: string;
    layer: ProgressionLayer;
    helpers: Helpers;
}

async function checkTasksForMinAttempts(options: CheckTasksForMinAttemptsOptions) {
    const { roomId, layer, helpers } = options;
    const verifications = layer?.verifications?.filter((verification) => {
        const { minAttempts } = verification;
        return minAttempts !== undefined;
    }) ?? [];
    const enrichments = layer?.enrichments?.filter((enrichment) => {
        const { minAttempts } = enrichment;
        return minAttempts !== undefined;
    }) ?? [];
    const tasks = [...verifications, ...enrichments];
    const taskModerationAmounts = await Promise.allSettled(tasks.map(async (task) => {
        const { id: taskId } = task;
        const jobKey = generateProgressionJobKey(roomId, taskId);
        const moderations = await getModerationsByJobKey(jobKey);
        const amount = moderations?.length ?? 0;

        return {
            taskId,
            amount,
        };
    }));
    const failedMinAttemptTaskResults = taskModerationAmounts.map((taskModerationAmount) => {
        if (taskModerationAmount.status !== 'fulfilled') {
            helpers.logger.error(`Coult not check the amount of moderations for a task, because of the following error: ${taskModerationAmount.reason}`);
            return false;
        }

        const { taskId, amount } = taskModerationAmount.value;
        const task = tasks.find((task) => {
            return task.id === taskId;
        });

        if (!task) {
            helpers.logger.error(`Could not find the task for the following task ID when checking minimum attempts: ${taskId}`);
            return false;
        }

        return amount >= (task?.minAttempts ?? 0);
    });
    const hasFailedMinAttemptTasks = failedMinAttemptTaskResults.includes(false);

    return hasFailedMinAttemptTasks;
}

interface TriggerVerificationsOptions {
    currentLayer: ProgressionLayer;
    currentLayerIndex: number;
    progressionTaskBaseContext: ProgressionTasksBaseContext;
    helpers: Helpers;
}

async function triggerVerifications(options: TriggerVerificationsOptions) {
    if (ROOM_PROGRESSION_WITH_JOBS) {
        return addVerificationTaskJobs(options);
    }

    return executeVerificationTasks(options);
}

async function addVerificationTaskJobs(options: TriggerVerificationsOptions) {
    const { helpers, progressionTaskBaseContext } = options;
    const { roomId } = progressionTaskBaseContext;
    const handledVerifications = await filterVerifications(options);

    try {
        return await waitForAllProgressionTasks({
            progressionTasks: handledVerifications,
            ...progressionTaskBaseContext,
        });
    } catch (error) {
        helpers.logger.error(`Could not update progression, because some of the verification task jobs failed. Room ID: ${roomId}, Reason: ${error}`);
    }
}

async function executeVerificationTasks(options: TriggerVerificationsOptions) {
    const { helpers, progressionTaskBaseContext } = options;
    const { roomId } = progressionTaskBaseContext;
    const handledVerifications = await filterVerifications(options);

    try {
        return await handleProgressionTasks({
            progressionTasks: handledVerifications,
            ...progressionTaskBaseContext,
        });
    } catch (error) {
        helpers.logger.error(`Could not update progression, because some of the verifications failed. Room ID: ${roomId}, Reason: ${error}`);
    }
}

async function filterVerifications(options: TriggerVerificationsOptions) {
    const { currentLayer, currentLayerIndex, helpers, progressionTaskBaseContext } = options;
    const { roomId } = progressionTaskBaseContext;
    const currentLayerId = currentLayer?.id;
    const currentLayerVerifications = currentLayer?.verifications ?? [];
    const activeVerifications = currentLayerVerifications.filter((verification) => verification.active ?? true);
    const persistentVerifications = progressionTopology.layers.slice(0, currentLayerIndex).flatMap((topologyLayer) => {
        const verifications = topologyLayer?.verifications ?? [];
        return verifications.filter((verification) => {
            const { active = true, persistent = false } = verification;

            return active && persistent;
        });
    });
    const handledVerifications = [...activeVerifications, ...persistentVerifications];

    helpers.logger.info(`Filtered ${activeVerifications.length} active verifications and ${persistentVerifications.length} persistent verifications for room ${roomId} in progression layer ${currentLayerId}.`);

    return handledVerifications;
}

export function getModerationJobKeyForRoomProgression(roomId: string, layerId: ProgressionLayerId) {
    return `updateRoomProgression-room-${roomId}-layer-${layerId}`;
}

interface TriggerEnrichmentsOptions {
    enrichments: ProgressionEnrichmentTask[] | undefined;
    progressionTaskBaseContext: ProgressionTasksBaseContext;
    executionTypes: EnrichmentExecutionType[];
    helpers: Helpers;
}

/**
 * Trigger a set of enrichments that can be either blocking or non-blocking and filter them on a certain execution type
 */
async function triggerEnrichments(options: TriggerEnrichmentsOptions) {
    const { enrichments, progressionTaskBaseContext, executionTypes, helpers } = options;
    const { roomId, progressionLayerId } = progressionTaskBaseContext;

    // guard: check if the enrichments are valid
    if (!enrichments || isEmpty(enrichments)) {
        return;
    }

    const activeEnrichments = enrichments.filter((enrichment) => {
        const { active = true, executionType = 'onNotVerified' } = enrichment;
        return active && executionTypes.includes(executionType);
    });
    const validConditionEnrichmentIds = flat(await Promise.all(activeEnrichments.map(async (enrichment) => {
        const { conditions = [], id: enrichmentId } = enrichment;

        // guard: check if there are conditions
        if (isEmpty(conditions)) {
            return Promise.all([Promise.resolve(enrichmentId)]);
        }

        // handle multiple conditions
        return Promise.all(conditions?.map(async (condition) => {
            return new Promise<string>((resolve) => {
                const { progressionTaskId, isVerified: shouldBeVerified } = condition;
                const jobKey = generateProgressionJobKey(roomId, progressionTaskId);

                getLastCompletedModerationByJobKey(jobKey).then((lastModeration) => {
                    const result = lastModeration?.result as unknown as VerificationFunctionCompletionResult;
                    const isVerified = result?.verified ?? false;

                    // when the required verification matches the result the promise should resolve to true
                    if (isVerified === shouldBeVerified) {
                        return resolve(enrichmentId);
                    }

                    resolve('');
                });
            });
        }));
    })));
    const filteredEnrichments = activeEnrichments.filter((activeEnrichment) => {
        const { id: enrichmentId, conditions } = activeEnrichment;
        const hasValidConditions = validConditionEnrichmentIds.includes(enrichmentId);

        if (hasValidConditions) {
            helpers.logger.info(`Enrichment ${enrichmentId} has valid conditions and will be triggered: ${JSON.stringify(conditions)}`);
        } else {
            helpers.logger.info(`Enrichment ${enrichmentId} has invalid conditions and will be skipped: ${JSON.stringify(conditions)}`);
        }
        return hasValidConditions;
    });
    const nonBlockingEnrichments = filteredEnrichments.filter((enrichment) => {
        return !enrichment.waitFor;
    });
    const blockingEnrichments = filteredEnrichments.filter((enrichment) => {
        return enrichment.waitFor;
    });

    helpers.logger.info(`Triggering ${filteredEnrichments.length} enrichments (types: ${JSON.stringify(executionTypes)}) for room ${roomId} in progression layer ${progressionLayerId}.`);

    // NOTE: catch errors here, because we want to continue with the other enrichments
    // try-catch clause only works with awaiting promises.
    handleProgressionTasks({
        progressionTasks: nonBlockingEnrichments,
        ...progressionTaskBaseContext,
    }).catch((error) => {
        helpers.logger.error(`Could not trigger non blocking enrichments for room ${roomId} in layer ${progressionLayerId}: ${error}`);
    });

    try {
        await handleProgressionTasks({
            progressionTasks: blockingEnrichments,
            ...progressionTaskBaseContext,
        });
    } catch (error) {
        helpers.logger.error(`Could not trigger blocking enrichments for room ${roomId} in layer ${progressionLayerId}: ${error}`);
    }
}

interface WaitForAllProgressionTasksOptions {
    progressionTasks: ProgressionTask[];
    progressionLayerId: ProgressionLayerId;
    roomId: string;
    helpers: Helpers;
}

/**
 * Helper to wait for all progressions tasks to complete and return the failed progression task IDs.
 * This makes it easy to check which verifications did not pass.
 */
async function waitForAllProgressionTasks(options: WaitForAllProgressionTasksOptions) {
    const { helpers } = options;
    const { settledJobs = [] } = await handleProgressionTasks(options);
    const jobs = settledJobs.map((job) => {
        if (job.status !== 'fulfilled') {
            return;
        }

        return job.value;
    }).filter((job): job is Job => {
        return !!job;
    });

    const completedModerationTuples = await waitForAllModerationCompletions({
        jobs,
    });
    const failedModerationTuples = completedModerationTuples.filter((completedModerationTuple) => {

        if (completedModerationTuple.status === 'rejected') {
            return true;
        }

        const { moderation } = completedModerationTuple.value;
        const isFailed = isFailedModeration(moderation);

        return isFailed;
    });
    const failedProgressionTaskIds = failedModerationTuples.map((failedModerationTuple) => {

        if (failedModerationTuple.status === 'rejected') {
            helpers.logger.error(`A job failed to complete for the following reason: ${JSON.stringify(failedModerationTuple.reason)}`);
            return 'unknown';
        }

        const { job: failedJob } = failedModerationTuple.value;
        const failedJobPayload = failedJob?.payload as BaseProgressionWorkerTaskPayload;
        const progressionTaskId = failedJobPayload?.progressionTask?.id ?? 'unknown';

        return progressionTaskId;
    });

    return {
        completedModerationTuples,
        failedProgressionTaskIds,
    };
}

function isFailedModeration(moderation: Moderation) {
    const result = moderation?.result as unknown as VerificationFunctionCompletionResult;

    if (!isObject(result)) {
        return true;
    }

    const hasResult = result ?? false;
    const isVerified = result?.verified ?? true;

    return !hasResult || !isVerified;
}

interface ProgressionTasksContext {
    progressionTasks: ProgressionTask[];
    progressionLayerId: ProgressionLayerId;
    roomId: string;
    helpers: Helpers;
}

type ProgressionTasksBaseContext = Omit<ProgressionTasksContext, 'progressionTasks'>;

interface ProgressionTaskHandlerResult {
    completedModeratorTaskTuples?: ModeratorTaskTuple[];
    failedProgressionTaskIds?: string[];
    settledJobs?: PromiseSettledResult<Job>[];
}

/**
 * Helper to handle all progression tasks. This can either be done by directly executing them or by adding them to the job system.
 */
async function handleProgressionTasks(options: ProgressionTasksContext): Promise<ProgressionTaskHandlerResult> {
    const { roomId } = options;
    const { hasErroredProgressionTasks, validProgressionTasks, erroredProgressionTasks } = await filterProgressionTasks(options);

    if (hasErroredProgressionTasks) {
        return Promise.reject(`Could not add progression task jobs for room ${roomId} because one of the verifications failed before executing the jobs. Failed verifications: ${JSON.stringify(erroredProgressionTasks)}`);
    }

    const [tasksResult, moderationsInsertResult] = await Promise.allSettled([
        ROOM_PROGRESSION_WITH_JOBS ?
            addProgressionTaskJobs({
                ...options,
                progressionTasks: validProgressionTasks,
            }) :
            executeProgressionTasks({
                ...options,
                progressionTasks: validProgressionTasks,
            }),
        supabaseClient.from("moderations").insert(validProgressionTasks.map((progressionTask) => {
            const { id: progressionTaskId, workerTaskId } = progressionTask;
            const jobKey = generateProgressionJobKey(roomId, progressionTaskId);

            return {
                type: progressionTaskId,
                job_key: jobKey,
                statement: `A room received a progression task with worker task ID: ${workerTaskId}.`,
                target_type: 'room',
                room_id: roomId,
            } satisfies Database['public']['Tables']['moderations']['Insert'];
        })),
    ]);

    // guard: check if the results are valid
    if (tasksResult.status === 'rejected') {
        return Promise.reject(`Could not handle progression tasks for room ${roomId}: ${tasksResult.reason}`);
    }

    if (moderationsInsertResult.status === 'rejected') {
        return Promise.reject(`Could not insert moderations when logging progression tasks for room ${roomId}: ${moderationsInsertResult.reason}`);
    }

    return tasksResult.value;
}

/**
 * Helper to add all progression tasks as jobs to the job system. Along with this it also adds a moderation to the database.
 * This allows us to track which progression tasks are triggered in the past to filter them for cooldowns and maximum attempts.
 */
async function addProgressionTaskJobs(options: ProgressionTasksContext) {
    const { roomId, helpers, progressionLayerId, progressionTasks } = options;
    const settledJobs = await Promise.allSettled(progressionTasks.map((progressionTask) => {
        const { id: progressionTaskId, workerTaskId } = progressionTask;
        const jobKey = generateProgressionJobKey(roomId, progressionTaskId);

        helpers.logger.info(`Adding worker task ${workerTaskId} via progression task with job key: ${jobKey}`);

        return helpers.addJob(workerTaskId, {
            progressionTask,
            progressionLayerId,
            jobKey,
            roomId,
        } satisfies BaseProgressionWorkerTaskPayload, {
            jobKey,
        });
    }));

    return {
        settledJobs,
    };
}

/**
 * Directly exectute all progression tasks without adding them to the job system.
 */
async function executeProgressionTasks(options: ProgressionTasksContext) {
    const { roomId, helpers, progressionLayerId, progressionTasks } = options;

    // run in parallel to optimize speed of these tasks
    const settledProgressionTasks = await Promise.allSettled(progressionTasks.map(async (progressionTask) => {
        const { id: progressionTaskId, workerTaskId } = progressionTask;
        const jobKey = generateProgressionJobKey(roomId, progressionTaskId);
        const progressionTaskExecutor = progressionTaskExecutorLookup[workerTaskId];
        const payload: BaseProgressionWorkerTaskPayload = {
            progressionTask,
            progressionLayerId,
            jobKey,
            roomId,
        };

        return progressionTaskExecutor(payload, helpers);
    }));

    const completedModeratorTaskTuples: ModeratorTaskTuple[] = [];
    const failedProgressionTaskIds: string[] = [];

    settledProgressionTasks.map((settledProgressionTask, taskIndex) => {
        const progressionTask = progressionTasks[taskIndex];
        const { id: progressionTaskId } = progressionTask;

        // guard: set failed when the task failed
        if (settledProgressionTask.status === 'rejected') {
            failedProgressionTaskIds.push(progressionTaskId);
            return;
        }

        const moderatorTaskTuple = settledProgressionTask.value;

        // guard: set failed when there was no moderation record made
        if (!moderatorTaskTuple || !moderatorTaskTuple.moderation) {
            failedProgressionTaskIds.push(progressionTaskId);
            return;
        }

        completedModeratorTaskTuples.push(moderatorTaskTuple);
    });

    return {
        completedModeratorTaskTuples,
        failedProgressionTaskIds,
    };
}

async function filterProgressionTasks(options: ProgressionTasksContext) {
    const { progressionTasks, roomId, helpers, progressionLayerId } = options;

    // resolved = should be handled
    // rejected = cooldown or something else is not verified
    // undefined = should be skipped
    const settledProgressionTasks = await Promise.allSettled(progressionTasks.map(async (progressionTask) => {
        const { id: progressionTaskId, active = true, cooldown, maxAttempts } = progressionTask;
        const { blockProgression = true, minMessageAmount, maxMessageAmount, durationMs: cooldownMs, startDelayMs } = cooldown ?? {};
        const jobKey = generateProgressionJobKey(roomId, progressionTaskId);

        if (!active) {
            return;
        }

        // skip this task if we have reached the maximum amount of attempts
        if (maxAttempts) {
            const moderations = await getCompletedModerationsByJobKey(jobKey, maxAttempts);
            const moderationAmount = moderations?.length ?? 0;

            // guard: check if we have failed moderations
            if (moderationAmount >= maxAttempts) {
                helpers.logger.info(`The maximum amount of attempts has been reached for job ${jobKey}. Attempts: ${moderationAmount}, max attempts: ${maxAttempts}.`);
                return;
            }
        }

        if (startDelayMs) {
            const roomProgressionJobKey = getModerationJobKeyForRoomProgression(roomId, progressionLayerId);
            const roomProgressionModeration = await getLastCompletedModerationByJobKey(roomProgressionJobKey);
            let startDelayReferenceDate = dayjs(roomProgressionModeration?.created_at);

            // when there is no moderation yet we will use the room creation date as a reference
            // this if for example needed when we're still in the first layer of the progression
            if (!roomProgressionModeration) {
                const room = await getRoomById(roomId);
                startDelayReferenceDate = dayjs(room?.created_at);
            }

            // check if we need to delay the first time this moderation ever runs
            // NOTE: first check this, because no fetching of messages is required
            if (startDelayMs) {
                const delayRemainder = Math.abs(dayjs().diff(startDelayReferenceDate, 'ms'));
                const isDelaying = delayRemainder < startDelayMs;

                // guard: check if the delay is valid
                if (isDelaying) {
                    helpers.logger.info(`The start delay is still active for job ${jobKey}. Delay remaining: ${delayRemainder}ms.`);

                    if (blockProgression) {
                        const errorMessage = `Progression task ${progressionTaskId} for room ${roomId} is still delaying and should block progress. Delay: ${startDelayMs}ms.`;
                        helpers.logger.error(errorMessage);
                        return Promise.reject(errorMessage);
                    } else {
                        helpers.logger.info(`Progression task ${progressionTaskId} for room ${roomId} is still delaying, but should NOT block progress. Delay: ${startDelayMs}ms.`);
                        return;
                    }
                }
            }
        }

        // check for a couple of properties that need the last moderation to be fetched
        // TODO: refactor these checks into a single function, because a lot of the logic is the same
        // we will do this once we have discovered more of these checks
        if (minMessageAmount || maxMessageAmount || cooldownMs) {
            const lastModeration = await getLastCompletedModerationByJobKey(jobKey);
            const lastModerationDate = dayjs(lastModeration?.created_at);

            // check if we need to verify the cooldown before adding the job
            // NOTE: first check this, because no fetching of messages is required
            if (cooldownMs && lastModeration) {
                const cooldownRemainder = lastModerationDate.add(cooldownMs, 'ms').diff(dayjs(), 'ms');
                const isCoolingDown = cooldownRemainder > 0;

                // guard: check if the cooldown is valid
                if (isCoolingDown) {
                    helpers.logger.info(`The cooldown is still active for job ${jobKey}. Cooldown remaining: ${cooldownRemainder}ms.`);

                    if (blockProgression) {
                        const errorMessage = `Progression task ${progressionTaskId} for room ${roomId} is still cooling down and should block progress. Cooldown: ${cooldownRemainder}ms.`;
                        helpers.logger.error(errorMessage);
                        return Promise.reject(errorMessage);
                    } else {
                        helpers.logger.info(`Progression task ${progressionTaskId} for room ${roomId} is still cooling down, but should NOT block progress. Cooldown: ${cooldownRemainder}ms.`);
                        return;
                    }
                }
            }

            // check if we need to verify the amount of messages before adding the job
            if ((minMessageAmount || maxMessageAmount) && lastModeration) {
                const fromDate = (lastModeration ? lastModerationDate : undefined);
                const newMessages = await getMessagesAfter({
                    roomId,
                    fromDate,
                });
                const newMessageAmount = newMessages.length;

                // guard: check if the min max is not exceeded
                if ((minMessageAmount && newMessageAmount < minMessageAmount) || (maxMessageAmount && newMessageAmount > maxMessageAmount)) {
                    const minMaxMessage = `Range: min ${minMessageAmount}, max ${maxMessageAmount}, actual: ${newMessageAmount}.`;
                    helpers.logger.info(`The new amount of messages after ${lastModerationDate} out of range for job ${jobKey}. ${minMaxMessage}`);

                    if (blockProgression) {
                        const errorMessage = `Progression task ${progressionTaskId} for room ${roomId} has out or range messages and should block progress. ${minMaxMessage}`;
                        helpers.logger.error(errorMessage);
                        return Promise.reject(errorMessage);
                    } else {
                        helpers.logger.info(`Progression task ${progressionTaskId} for room ${roomId} has out of range messages, but should NOT block progress. ${minMaxMessage}`);
                        return;
                    }
                }
            }
        }

        return progressionTask;
    }));
    const erroredProgressionTasks = settledProgressionTasks.filter((settledProgressionTask) => {
        return settledProgressionTask.status === 'rejected';
    });
    const hasErroredProgressionTasks = erroredProgressionTasks.length > 0;
    const fulfilledProgressionTasks = settledProgressionTasks.filter((settledProgressionTask) => {
        return settledProgressionTask.status === 'fulfilled';
    });
    const settledValidProgressionTasks = fulfilledProgressionTasks.filter((fulfilledProgressionTask) => {
        return fulfilledProgressionTask.status === 'fulfilled' && fulfilledProgressionTask.value !== undefined;
    }) as PromiseFulfilledResult<ProgressionTask>[];
    const validProgressionTasks = settledValidProgressionTasks.map((settledValidProgressionTask) => {
        return settledValidProgressionTask.value;
    });

    return {
        hasErroredProgressionTasks,
        erroredProgressionTasks,
        validProgressionTasks,
    };
}

/**
 * Generate a job key for a progression task to be unique for each room.
 */
function generateProgressionJobKey(roomId: string, progressionTaskId: string) {
    const jobKey = `room-${roomId}-progression-task-${progressionTaskId}`;
    return jobKey;
}
