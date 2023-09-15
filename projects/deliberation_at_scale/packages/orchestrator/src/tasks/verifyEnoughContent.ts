// script for checking whether there is enough content for forming a consensus
import { Helpers, quickAddJob } from "graphile-worker";
import supabaseClient, { Message, selectMessages } from "../lib/supabase";
import openaiClient from "../lib/openai";
import { CreateChatCompletionRequestMessage } from "openai/resources/chat";
import { Database } from "../generated/database.types";

const TASK_INTERVAL_SECONDS = 45;
const historyAmountSeconds = 45;

export default async function enoughContent(
    lastRun: string | null,
    helpers: Helpers
) {

    console.log("ik ben hier");
    // Retrieve messages from supabase
    const messages = await selectMessages(historyAmountSeconds);
    
    // GUARD: If there are no messages, reschedule the job
    if (messages != null) {
        if (messages.length === 0 ) {
            helpers.logger.info("No messages found.");
            return reschedule(lastRun);
        }
    }

    return reschedule(lastRun);

}

function reschedule(initialDate: string | null) {
    // Re-schedule this job n seconds after the last invocation
    quickAddJob({}, "enoughContent", new Date(), {
        runAt: new Date(
            (initialDate ? new Date(initialDate) : new Date()).getTime() +
      1_000 * TASK_INTERVAL_SECONDS
        ),
        jobKey: "enoughContent",
        jobKeyMode: "preserve_run_at",
    });
}