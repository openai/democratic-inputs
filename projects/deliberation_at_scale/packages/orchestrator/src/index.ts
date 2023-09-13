/* eslint-disable no-console */
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

import { startListener, stopListener } from "./listener";
import { startRunner, stopRunner } from "./runner";
import { startScheduler, stopScheduler } from "./scheduler";

const startupTasks = {
    startScheduler,
    startRunner,
    startListener,
};

const shutdownTasks = {
    stopListener,
    stopScheduler,
    stopRunner,
};

async function start() {
    console.log('Start initiated...');
    for (const [taskName, task] of Object.entries(startupTasks)) {
        task().catch((error) => {
            console.error(`An error occured with the ${taskName}:`);
            console.error(error);
            process.exit(1);
        });
    }
}

async function shutdown() {
    console.log('Graceul shutdown initiated...');
    for (const [taskName, task] of Object.entries(shutdownTasks)) {
        task().catch((error) => {
            console.error(`An error occured with the ${taskName}:`);
            console.error(error);
            process.exit(1);
        });
    }
}

// handle graceful shutdowns
process.on('SIGINT', shutdown);

// startup
(async() => {
    await start();
})();


