import { Helpers, quickAddJob } from "graphile-worker";
import supabase from "../lib/supabase";
import openai from "../lib/openai";
import { CreateChatCompletionRequestMessage } from "openai/resources/chat";

/**
 * Run this task at most every n seconds
 */
const TASK_INTERVAL_SECONDS = 45;

/**
 * This task retrieves all messages since its last execution and attempts to
 * summarize them using GPT.
 */
export default async function summarize(
    lastRun: string | null,
    helpers: Helpers
) {
    // Retrieve all messages from supabase
    let statement = supabase.from("messages").select().eq("type", "chat");

    if (lastRun) {
        statement = statement.gt("created_at", lastRun);
    }

    const messages = await statement;

    // GUARD: Throw when we receive an error
    if (messages.error) {
        throw messages.error;
    }

    // GUARD: If there are no messages, reschedule the job
    if (messages.data.length === 0) {
        helpers.logger.info("No messages found.");
        return reschedule(lastRun);
    }

    // Request GPT to summarize the set of messages
    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content:
          "You are a conversational facilitator. Based on the conversation provided, create a response that would help the conversation reach its full potential. Answer any general knowledge questions participants might have, ask good questions, make everyone feel safe and like their contribution matters. Above all, be a natural conversation partner to the people in the conversation.",
            },
            ...messages.data.map(
                (message) =>
                    ({
                        role: "user",
                        content: message.content,
                    } as CreateChatCompletionRequestMessage)
            ),
        ],
    });

    // Parse completions into string
    const result = completion.choices.map((c) => c.message.content).join("");
    helpers.logger.info("Retrieved completion: " + JSON.stringify(completion));

    // Insert it as a string
    await supabase.from("messages").insert({
        type: "bot",
        content: result,
    });

    return reschedule(lastRun);
}

/**
 * Reschedule this job for the next iteration
 */
function reschedule(initialDate: string | null) {
    // Re-schedule this job n seconds after the last invocation
    quickAddJob({}, "summarize", new Date(), {
        runAt: new Date(
            (initialDate ? new Date(initialDate) : new Date()).getTime() +
        1_000 * TASK_INTERVAL_SECONDS
        ),
        jobKey: "summarize",
        jobKeyMode: "preserve_run_at",
    });
}
