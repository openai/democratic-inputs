import OpenAI from 'openai';
import Message from '../types/message';
import FlagResponse from '../types/flagResponse';

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], 
});


export default async function badLanguage(message: Message) {    
  const flaggedByModeration = await isFlaggedByModeration(message);
  const flaggedByRules = await isFlaggedByDiscussionRules(message);

  if(flaggedByModeration.flagged || flaggedByRules?.flagged) {
    const reasons = [flaggedByRules?.reason, flaggedByModeration.reason].filter(Boolean).join(', '); // Join reasons if not null
    const moderationMessage = await writeModerationResponse(reasons);
    console.log('Message\t\t', message.id, '\nReason\t\t', reasons, '\nModeration\t', moderationMessage, '\n');

    // TODO: add rate limiting how often a moderation message can be send
  }

  return;
} 

// Use OpenAI's moderation API endpoint
async function isFlaggedByModeration(message: Message): Promise<FlagResponse> {
  const moderationResponse = await openai.moderations.create({
    input: message.content,
  });

  // Get the names of categories that have been flagged
  const allCategories = moderationResponse.results[0].categories;
  const flaggedCategories = Object.keys(Object.fromEntries(Object.entries(allCategories).filter(([,v]) => v)));

  const result = {
    flagged: moderationResponse.results[0].flagged, 
    reason: (flaggedCategories.length === 0) ? null : `Message violates categories: ${flaggedCategories.join(', ')}`,
  }

  return result;
}

async function isFlaggedByDiscussionRules(message: Message): Promise<{flagged: boolean, reason: string} | undefined> {
      const completion = await openai.chat.completions.create({
      temperature: 0.2,
      messages: [
        { role: 'user', content: `
          You are the supervisor of a discussion. You must make sure that the message below adheres to the following rules: 
          - Messages may not contain insults to humans or other entities
          - Messages may not describe physical attributes of humans

          return a JSON object in the following format: { flagged: {boolean, true if message does not pass rules}, reason: {short reason why a message is flagged. Null if flagged is false} }

          Message: ${message.content}
        `},      
      ],
      model: 'gpt-4',
    }); 
    const completionResult = completion.choices[0].message.content;

    if (!completionResult) {
      // throw error?
      return;
    }

    const result = JSON.parse(completionResult);

    return result;
}

async function writeModerationResponse(reason: string): Promise<FlagResponse | null> {
  const completion = await openai.chat.completions.create({
    temperature: 0.8,
    messages: [
      { role: 'user', content: `
        You are the supervisor of a discussion. A message has been flagged as inappropriate because of the following reasons:
        ${reason}

        Formulate a message of max. 20 words to guide the discussion.

        return a JSON object in the following format: { message: {your moderation message} }
      `},      
    ],
    model: 'gpt-4',
  }); 

  const completionResult = completion.choices[0].message.content;
  if (!completionResult) {
    // throw error?
    return null;
  }

  const message = JSON.parse(completionResult).message;

  return message;
}