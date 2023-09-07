import OpenAI from 'openai';
import Message from '../types/message';
import FlagResponse from '../types/flagResponse';

const openai = new OpenAI({
    apiKey: process.env["OPENAI_API_KEY"],
});

export default async function difficultLanguage(message: Message) {
    const flaggedByRules = await isFlaggedByRules(message);

    if(flaggedByRules.flagged) {
        const moderationMessage = await writeModerationResponse(flaggedByRules?.reason);
        console.log('Message\t\t', message.id, '\nReason\t\t', flaggedByRules?.reason, '\nModeration\t', moderationMessage, '\n');
    }
}

async function isFlaggedByRules(message: Message) {
    const completion = await openai.chat.completions.create({
        temperature: 0.2,
        messages: [
            {
                role: 'user', content: `
            You are the supervisor of a discussion. You must make sure that the message below adheres to the following rules: 
            - Messages may not contain words that are difficult to understand
  
            return a JSON object in the following format: { flagged: {true if message does not pass rules, false if the message does pass the rules}, reason: {short reason why a message is flagged. Null if flagged is false} }

            Only return the JSON object, do not add any other information.

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
          You are the supervisor of a discussion. A message has been flagged as containing difficult language because of the following reason:
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