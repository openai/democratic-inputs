module.exports = {
  apps: [ {
    name: "scheduler",
    script: "./dist/index.js",
    env: {
        ORCHESTRATOR_ROLE: "all",
    },
  }],
};
