import OpenAI from 'openai';
import Message from '../types/message';

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], 
});

export default async function badLanguage(message: Message) {  


  const moderationResponse = await openai.moderations.create({
    input: message.content,
  });
  const flaggedMessage = moderationResponse.results[0].flagged;

  if (flaggedMessage) {
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: `You are the moderator of a discussion. The message below has been flagged as inappropriate. Write a message that a moderator would say to steer the conversation in 20 words. Message: ${message.content}` }],
      model: 'gpt-4',
    }); 
    console.log(completion.choices[0].message);

    // TODO: push moderation message to supabase.
  }
} 