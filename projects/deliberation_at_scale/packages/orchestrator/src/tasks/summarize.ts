import { Helpers, quickAddJob } from "graphile-worker";
import supabase from "../lib/supabase";
import openai from "../lib/openai";
import { CreateChatCompletionRequestMessage } from "openai/resources/chat";
import { Database } from "src/data/database.types";

//TODO: Retrieve this from database
const DISCUSSION_TOPIC = "Students are not allowed to use AI technology for their exams";

type Message = Database["public"]["Tables"]["messages"]["Row"]

let isUpdatingMessage = false;
let isAddingModeration = false;

/**
 * Run this task at most every n seconds
 */
const TASK_INTERVAL_SECONDS = 10;

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
    const consensusCheckResult = await checkForConsensus(messages.data);

    if (consensusCheckResult?.result) {
        const moderatorOutput = await writeConsensusMessage(messages.data);

        if (!moderatorOutput) {
            //Send consensus message to chat
            return null;
        }

        addConsensusMessageToChat(moderatorOutput.content);
        addModerationMessage(moderatorOutput.content);
    }

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

async function checkForConsensus(messages: Message[]): Promise<{ result: boolean } | null> {
    const completion = await openai.chat.completions.create({
        temperature: 0,
        model: "gpt-4",
        messages: [
            {
                role: "system",
                content:
          `The following shows part of a discussion at this point in the discussion do the three participants have a consensus on the topic: "Students are not allowed to use AI technology for their exams"?

        return a JSON object in the following format: { result: {boolean, true if there is a consensus, false if no consensus can be formulated} }
        If yes say true if no say false.`,
            },
            ...messages.map(
                (message) =>
                    ({
                        role: "user",
                        content: message.content,
                    } as CreateChatCompletionRequestMessage)
            ),
        ],
    });

    const completionResult = completion.choices[0].message.content;
    console.log(completionResult);

    if (completionResult == null) {
        return null;
    }

    const result = JSON.parse(completionResult);

    return result;
}

async function writeConsensusMessage(messages: Message[]): Promise<{ content: string } | null> {
    const completion = await openai.chat.completions.create({
        model: "gpt-4",
        temperature: 0.8,
        messages: [
            {
                role: "system",
                content:
          `The following shows part of a discussion between three participants on the topic:
      "${DISCUSSION_TOPIC}"?.
      Output the consensus as a statement in less than 20 words.

      return a JSON object in the following format: { content: {the consensus statement}` ,
            },
            ...messages.map(
                (message) =>
                    ({
                        role: "user",
                        content: message.content,
                    } as CreateChatCompletionRequestMessage)
            ),
        ],
    });

    const completionResult = completion.choices[0].message.content;

    if (!completionResult) {
        return null;
    }

    const result = JSON.parse(completionResult);

    return result;

}

async function addConsensusMessageToChat(moderationMessageContent: string) {
    // update the message
    isUpdatingMessage = true;
    try {
        const result = await supabase
            .from("messages")
            .insert({
                content: moderationMessageContent,
                type: "bot",
            });
        const hasError = !!result.error;

        if (hasError) {
            throw new Error(result.error.message);
        }
    } catch (error) {
    // TODO: handle errors
    }

    isUpdatingMessage = false;
}

async function addModerationMessage(moderationMessageContent: string) {
    // update the message
    isAddingModeration = true;
    try {
        const result = await supabase.from("moderations").insert({
            type: 'consensus',
            statement: moderationMessageContent,
            target_type: 'moderation',
        });

        const hasError = !!result.error;

        if (hasError) {
            throw new Error(result.error.message);
        }
    } catch (error) {
    // TODO: handle errors
    }

    isAddingModeration = false;
}
