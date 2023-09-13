import { parseCronItems, run } from "graphile-worker";
import crontab from "./crontab";

export async function startRunner() {
    const runner = await run({
        concurrency: 5,
        taskDirectory: `${__dirname}/tasks`,
        parsedCronItems: parseCronItems(crontab),
        noPreparedStatements: true,
    });
    await runner.promise;
}

export async function stopRunner() {

}
