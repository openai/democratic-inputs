require("dotenv").config()
import { parseCronItems, run } from "graphile-worker"
import crontab from "./crontab"

async function main() {
  const runner = await run({
    concurrency: 5,
    taskDirectory: `${__dirname}/tasks`,
    parsedCronItems: parseCronItems(crontab),
    noPreparedStatements: true,
  })

  await runner.promise
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
