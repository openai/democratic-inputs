//TODO: change naming of tasks to new names

require("dotenv").config();
import { parseCronItems, run, quickAddJob } from "graphile-worker";
import crontab from "./crontab";
import supabase from "./lib/supabase";
import startScheduler from './scheduler';

async function main() {
    const runner = await run({
        concurrency: 5,
        taskDirectory: `${__dirname}/tasks`,
        parsedCronItems: parseCronItems(crontab),
        noPreparedStatements: true,
    });
    listenForNewMessages();
    await runner.promise;
}

async function listenForNewMessages() {
  const messageInsertListener = supabase
    .channel("supabase_realtime")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: "type=eq.chat",
      },
      (payload) => {
        const newMessage = payload.new
        console.log(newMessage)
        // add logic for supabase triggers.
        // for every message from supabase, quickAdd job the moderation task with the message as payload
        quickAddJob({}, "moderate", newMessage, {
          jobKey: "moderate",
          jobKeyMode: "preserve_run_at",
        });
        quickAddJob({}, "clarify", newMessage, {
          jobKey: "clarify",
          jobKeyMode: "preserve_run_at",
        });
      }
    )
    .subscribe()

    return () => {
        messageInsertListener.unsubscribe();
    };
}

listenForNewMessages().catch((err) => {
    console.error(err);
    process.exit(1);
});

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

startScheduler().catch((err) => {
  console.error(err)
  process.exit(1)
})