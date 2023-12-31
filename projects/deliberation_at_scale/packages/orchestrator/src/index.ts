/* eslint-disable no-console */
// NOTE: rename is required to avoid SWC having conflicing namespaces
// somehow this goes not well when the names are the same
import { i18n as i } from "@lingui/core";

import en from "../locales/en.js";
import nl from "../locales/nl.js";

import { LANGUAGE_LOCALE, ORCHESTRATOR_ROLE } from "./config/constants";
import { startListener, stopListener } from "./listener";
import { startMigrator, stopMigrator } from "./migrator";
import { startRunner, stopRunner } from "./runner";
import { startScheduler, stopScheduler } from "./scheduler";
import { OrchestratorRoleTask } from "./types";

const tasks: OrchestratorRoleTask[] = [
    {
        name: 'migrator',
        startTask: startMigrator,
        stopTask: stopMigrator,
        roles: ['migrator'],
    },
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
            continue;
        }

        console.log(`Running task ${name}...`);
        taskHandler().then(() => {
            console.log(`Successfully finished the task ${name}`);
        }).catch((error) => {
            console.error(`An error occurred with the task ${name}:`);
            console.error(error);
            process.exit(1);
        });
    }
}

async function loadLanguage() {
    i.load("nl", nl.messages);
    i.load("en", en.messages);
    i.activate(LANGUAGE_LOCALE);
    console.log(`Loaded language ${LANGUAGE_LOCALE}`);
}

async function start() {
    console.log('Starting up peacefully...');
    await loadLanguage();
    await runTasks('startTask');
}

async function shutdown() {
    console.log('Shutting down gracefully...');
    await runTasks('stopTask');
}

// handle graceful shutdowns
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('SIGQUIT', shutdown);

// startup
(async() => {
    await start();
})();
