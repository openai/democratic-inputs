require("dotenv").config()
import { quickAddJob } from "graphile-worker"
import supabase from "./lib/supabase"

async function startScheduler() {
  quickAddJob({}, "summarize", 0, {
    jobKey: "summarize",
    jobKeyMode: "preserve_run_at",
  })
  // add logic for supabase triggers.
  // for every message from supabase, quickAdd job the moderation task with the message as payload
}

export default startScheduler;
