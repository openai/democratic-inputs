import { makeWorkerUtils } from "graphile-worker";
import { DATABASE_URL } from "./config/constants";

export async function startMigrator() {
    const runnerUtils = await makeWorkerUtils({
        connectionString: DATABASE_URL,
    });

    runnerUtils.logger.info(`Running worker migrations`);
    await runnerUtils.migrate();
    runnerUtils.logger.info(`Migrated all worker requirements!`);
    process.exit(0);
}

export async function stopMigrator() {
    // empty
}
