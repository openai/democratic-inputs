module.exports = {
    apps: [
        // {
        //     name: "all",
        //     script: "./dist/index.js",
        //     env: {
        //         ORCHESTRATOR_ROLE: "all",
        //     },
        // },
        {
            name: "runner",
            script: "./dist/index.js",
            mode: "cluster",
            instances: 7, // max amount of cores, minus listener
            env: {
                ORCHESTRATOR_ROLE: "runner",
            },
        },
        {
            name: "scheduler",
            script: "./dist/index.js",
            autorestart: false,
            env: {
                ORCHESTRATOR_ROLE: "scheduler",
            },
        },
        {
            name: "listener",
            script: "./dist/index.js",
            env: {
                ORCHESTRATOR_ROLE: "listener",
            },
        },
    ],
};
