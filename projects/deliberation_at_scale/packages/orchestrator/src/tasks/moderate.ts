import { Helpers } from "graphile-worker";
import supabase from "../lib/supabase";
import openai from "../lib/openai";
import { Database } from "src/data/database.types";

type Message = Database["public"]["Tables"]["messages"]["Row"]

let isUpdatingMessage = false;
let isAddingModeration = false;

export default async function moderate(message: Message, helpers: Helpers) {
    // GUARD
    if (!message) {
        console.error('Moderation', "No message in payload");
    } else {
    // console.log(message.content)
    }

    const flaggedByModeration = await isFlaggedByModeration(message);
    const flaggedByRules = await isFlaggedByDiscussionRules(message);

    // If message is flagged by moderation API or our custom rules, create moderation message.
    if(flaggedByModeration.result || flaggedByRules?.result) {
        const flagReasons = [flaggedByRules?.content, flaggedByModeration.content].filter(Boolean).join(', '); // Combine reasons if not null

        // Formulate a moderation message based on the flag reasons
        const moderationMessage = await writeModerationResponse(flagReasons);

        if (moderationMessage) {
            replaceFlaggedMessage(message, moderationMessage.content);
            addModerationMessage(message, moderationMessage.content);
        }
    }
}

// Use OpenAI's moderation API endpoint
async function isFlaggedByModeration(message: Message): Promise<{result: boolean, content: string | null}> {
    const moderationResponse = await openai.moderations.create({
        input: message.content,
    });

    // Get the names of categories that have been flagged
    const allCategories = moderationResponse.results[0].categories;
    const flaggedCategories = Object.keys(Object.fromEntries(Object.entries(allCategories).filter(([,v]) => v)));

    const result = {
        result: moderationResponse.results[0].flagged,
        content: (flaggedCategories.length === 0) ? null : `Message violates categories: ${flaggedCategories.join(', ')}`,
    };

    return result;
}

// Use custom ruleset with completions API
async function isFlaggedByDiscussionRules(message: Message): Promise<{result: boolean, content: string | null} | null> {
    const completion = await openai.chat.completions.create({
        temperature: 0.2,
        messages: [
            { role: 'user', content: `
      You are the supervisor of a discussion. You must make sure that the message below adheres to the following rules:
      - Messages may not contain insults to humans or other entities
      - Messages may not describe physical attributes of humans

      return a JSON object in the following format: { result: {boolean, true if message does not pass rules}, content: {short reason why a message is flagged. null if flagged is false} }

      Message: ${message.content}
    `},
        ],
        model: 'gpt-4',
    });
    const completionResult = completion.choices[0].message.content;

    if (!completionResult) {
        // throw error?
        return null;
    }

    const result = JSON.parse(completionResult);

    return result;
}

async function writeModerationResponse(reason: string): Promise<{content: string} | null> {
    const completion = await openai.chat.completions.create({
        temperature: 0.8,
        messages: [
            { role: 'user', content: `
        You are the supervisor of a discussion. A message has been flagged as inappropriate because of the following reasons:
        ${reason}

        Formulate a message of max. 20 words to guide the discussion.

        return a JSON object in the following format: { content: {your moderation message} }
      `},
        ],
        model: 'gpt-4',
    });

    const completionResult = completion.choices[0].message.content;
    if (!completionResult) {
    // throw error?
        return null;
    }

    const message = JSON.parse(completionResult);

    return message;
}

async function replaceFlaggedMessage(message: Message, moderationMessageContent: string) {
    // update the message
    isUpdatingMessage = true;
    try {
        const result = await supabase
            .from("messages")
            .update({
                content: moderationMessageContent,
                type: "bot",
            })
            .eq("id", message.id);
        const hasError = !!result.error;

        if (hasError) {
            throw new Error(result.error.message);
        }
    } catch (error) {
        // TODO: handle errors
    }

    isUpdatingMessage = false;
}

async function addModerationMessage(message: Message, moderationMessageContent: string) {
    // update the message
    isAddingModeration = true;
    try {
        const result = await supabase.from("moderations").insert({
            type: 'harrashment',
            statement: moderationMessageContent,
            target_type: 'moderation',
            message_id: message.id,
            participant_id: message.participant_id,
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
