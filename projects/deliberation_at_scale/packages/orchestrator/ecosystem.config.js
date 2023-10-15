module.exports = {
    apps: [
        {
            name: "all",
            script: "./dist/index.js",
            env: {
                ORCHESTRATOR_ROLE: "all",
            },
        },
        // {
        //     name: "runner",
        //     script: "./dist/index.js",
        //     mode: "cluster",
        //     instances: 5,
        //     env: {
        //         ORCHESTRATOR_ROLE: "runner",
        //     },
        // },
        // {
        //     name: "scheduler",
        //     script: "./dist/index.js",
        //     env: {
        //         ORCHESTRATOR_ROLE: "scheduler",
        //     },
        // },
        // {
        //     name: "listener",
        //     script: "./dist/index.js",
        //     env: {
        //         ORCHESTRATOR_ROLE: "listener",
        //     },
        // },
    ],
};
