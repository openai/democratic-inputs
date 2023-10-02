module.exports = {
  apps: [{
    name: "runner",
    script: "./dist/index.js",
    instances : "5",
    exec_mode : "cluster",
    env: {
        ORCHESTRATOR_ROLE: "runner",
    },
  }, {
    name: "scheduler",
    script: "./dist/index.js",
    env: {
        ORCHESTRATOR_ROLE: "scheduler",
    },
  }, {
    name: "listener",
    script: "./dist/index.js",
    env: {
        ORCHESTRATOR_ROLE: "listener",
    },
  }],
};
