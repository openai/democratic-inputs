import { Runner, parseCronItems, run } from "graphile-worker";
import crontab from "./config/crontab";

let runner: Runner;

export async function startRunner() {
    runner = await run({
        concurrency: 10,
        taskDirectory: `${__dirname}/tasks`,
        parsedCronItems: parseCronItems(crontab),
        noPreparedStatements: true,
    });

    await runner.promise;
}

export function getRunner() {
    return runner;
}

export async function stopRunner() {
    await runner?.stop();
}
