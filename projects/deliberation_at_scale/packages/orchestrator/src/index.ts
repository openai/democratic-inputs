/* eslint-disable no-console */
import { ORCHESTRATOR_ROLE } from "./constants";
import { startListener, stopListener } from "./listener";
import { startRunner, stopRunner } from "./runner";
import { startScheduler, stopScheduler } from "./scheduler";
import { OrchestratorRoleTask } from "./types";

const tasks: OrchestratorRoleTask[] = [
    {
        name: 'runner',
        startTask: startRunner,
        stopTask: stopRunner,
        roles: ['runner', 'all'],
    },
    {
        name: 'listener',
        startTask: startListener,
        stopTask: stopListener,
        roles: ['listener', 'all'],
    },
    {
        name: 'scheduler',
        startTask: startScheduler,
        stopTask: stopScheduler,
        roles: ['scheduler', 'all'],
    },
];

async function runTasks(taskType: 'startTask' | 'stopTask') {
    console.log(`Running tasks for ${taskType} with role ${ORCHESTRATOR_ROLE}`);

    for (const task of tasks) {
        const { name, roles } = task;
        const taskHandler = task[taskType];
        const shouldExecuteTask = roles.includes(ORCHESTRATOR_ROLE);

        if (!shouldExecuteTask) {
            return;
        }

        console.log(`Running task ${name}...`);
        taskHandler().catch((error) => {
            console.error(`An error occured with the task ${name}:`);
            console.error(error);
            process.exit(1);
        });
    }
}

async function start() {
    runTasks('startTask');
}

async function shutdown() {
    runTasks('stopTask');
}

// handle graceful shutdowns
process.on('SIGINT', shutdown);

// startup
(async() => {
    await start();
})();


