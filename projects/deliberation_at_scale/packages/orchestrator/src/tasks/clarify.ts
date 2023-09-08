import { Helpers } from "graphile-worker"
import supabase from "../lib/supabase"
import openai from "../lib/openai"
import { json } from "stream/consumers"
import { Database } from "src/data/database.types"
import { type } from "os"

type Message = Database["public"]["Tables"]["messages"]["Row"]

let isUpdatingMessage = false;
let isAddingModeration = false;

export default async function clarify(message: Message, helpers: Helpers) {
  // GUARD
  if (!message) {
    console.error('Moderation', "No message in payload")
  } else {
    // console.log(message.content)
  }

  const flaggedByRules = await isFlaggedByClarityRules(message);

  // If message is flagged by clarification rules, create moderation message.
  if(flaggedByRules?.result) {
    // Formulate a clarification message based on the reason
    const clarificationMessage = await writeClarityResponse(flaggedByRules.content ?? 'null');

    if (clarificationMessage) {
      addClarificationMessageToChat(message, clarificationMessage.content);
      addModerationMessage(message, clarificationMessage.content);
    }
  }
}

// Use custom ruleset with completions API
async function isFlaggedByClarityRules(message: Message): Promise<{result: boolean, content: string | null} | null> {
  const completion = await openai.chat.completions.create({
      temperature: 0.2,
      messages: [
          {
              role: 'user', content: `
          You are the supervisor of a discussion. You must make sure that the message below adheres to the following rules: 
          - Messages may not contain words that are difficult to understand

          return a JSON object in the following format: { result: {true if message does not pass rules, false if the message does pass the rules}, content: {list of difficult words separated with ', ' if no difficult words are found: null} }

          Only return the JSON object, do not add any other information.

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

async function writeClarityResponse(words: string): Promise<{content: string, words: {word: string, explanation: string}[]} | null> {
  const moderationMessage = await openai.chat.completions.create({
    temperature: 0.8,
    messages: [
      { role: 'user', content: `      
        You are the supervisor of a discussion. A message has been flagged as containing difficult language. Replace {x} of the JSON with a message that you would say to make sure the discussion is accessible for all participators. 
        
        Do not add reasoning. Only return the JSON Format: 
        {
          content: {x}
        }`
      },      
    ],
    model: 'gpt-4',
  }); 

  const completionResult = moderationMessage.choices[0].message.content;

  if (!completionResult) {
    // throw error?
    return null;
  }

  const message = JSON.parse(completionResult);

  return message;
}

async function addClarificationMessageToChat(message: Message, moderationMessageContent: string) {
    // update the message
    isUpdatingMessage = true
    try {
      const result = await supabase
        .from("messages")
        .insert({
          content: moderationMessageContent,
          type: "bot",
        })
      const hasError = !!result.error

      if (hasError) {
        throw new Error(result.error.message)
      }
    } catch (error) {
      // TODO: handle errors
    }

    isUpdatingMessage = false
}

async function addModerationMessage(message: Message, moderationMessageContent: string) {
    // update the message
    isAddingModeration = true

    // FIX: other moderations types (e.g. clarification) is not added to moderations table
    try {
      const result = await supabase.from("moderations").insert({
        type: 'clarification' ,
        statement: moderationMessageContent, 
        target_type: 'moderation',
        message_id: message.id,
        participant_id: message.participant_id,
      });

      const hasError = !!result.error;

      if (hasError) {
        throw new Error(result.error.message)
      }
    } catch (error) {
      // TODO: handle errors
    }

    isAddingModeration = false
}


// TODO: add word explanations by highlighting words in conversations?
/*
  const wordExplanation = await openai.chat.completions.create({
    temperature: 0.8,
    messages: [
      { role: 'user', content: `      
        Explain in max. 20 words the words: ${words} 
      
        Do not add reasoning. Only return the JSON Format: 
        {
          content: 
          {
            word: {word}
            explanation: {explanation}
          }[]
        }`
      },      
    ],
    model: 'gpt-4',
  }); 
  */