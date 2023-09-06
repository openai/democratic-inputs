import OpenAI from 'openai';
import Message from '../types/message';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], 
});

export default async function consensus(messages: Message[]) {
  const formattedMessages: Array<ChatCompletionMessageParam> = messages.map((message) => ({role: 'user', content: message.content}));

  const completion = await openai.chat.completions.create({
    messages: [
      {role: 'system', content: 'Your are a discussion moderator. Check whether a consensus has been found between all participants. If a consensus is found return: {consensus: true}. if no consensus is found return: {consensus: false}' },
      ...formattedMessages,
    ],
    model: 'gpt-4',
  }); 

  const consensusFound = completion.choices[0].message;
  console.log('Consensus found: ', consensusFound);

  if (consensusFound) {
    // TODO: send consensus to chat as message
  }
}