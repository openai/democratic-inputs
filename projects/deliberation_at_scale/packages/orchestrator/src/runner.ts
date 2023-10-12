/* eslint-disable @typescript-eslint/no-var-requires */
import { Runner, RunnerOptions, WorkerUtils, makeWorkerUtils, parseCronItems, run } from "graphile-worker";
import crontab from "./config/crontab";
import { DATABASE_URL, ENABLE_TASK_TESTING } from "./config/constants";

let runner: Runner;
let runnerUtils: WorkerUtils;

export async function startRunner() {
    const runnerOptions: RunnerOptions = {
        concurrency: 20,
        taskDirectory: `${__dirname}/tasks`,
        parsedCronItems: parseCronItems(crontab),
        noPreparedStatements: true,
    };

    if (ENABLE_TASK_TESTING) {
        runnerOptions.taskDirectory = undefined;
        runnerOptions.taskList = {
            handleQueuedParticipants: require('./tasks/handleQueuedParticipants').default,
            // triggerRoomProgressionUpdates: require('./tasks/triggerRoomProgressionUpdates').default,
            // updateRoomProgression: require('./tasks/updateRoomProgression').default,
            // verifyConsensusForming: require('./tasks/verifyConsensusForming').default,
            // verifySafeLanguage: require('./tasks/verifySafeLanguage').default,
            // verifyOffTopic: require('./tasks/verifyOffTopic').default,
            // verifyEasyLanguage: require('./tasks/verifyEasyLanguage').default,
            // verifyGroupIntroduction: require('./tasks/verifyGroupIntroduction').default,
            // enrichGroupIntroduction: require('./tasks/enrichGroupIntroduction').default,
        };
    }

    runner = await run(runnerOptions);
    runnerUtils = await makeWorkerUtils({
        connectionString: DATABASE_URL,
    });

    await runner.promise;
}

export function getRunner() {
    return runner;
}

export function getRunnerUtils() {
    return runnerUtils;
}

export async function stopRunner() {
    await runner?.stop();
}
