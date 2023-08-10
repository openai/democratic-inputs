require('dotenv').config();
import { quickAddJob } from 'graphile-worker';

async function main() {
    quickAddJob({}, 'summarize', 0, { jobKey: 'summarize', jobKeyMode: 'preserve_run_at' });
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});