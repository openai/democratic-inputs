import OpenAI from 'openai';
import Message from '../types/message';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], 
});

export default async function equalContribution(messages: Message[]) {
  const formattedMessages: Array<ChatCompletionMessageParam> = messages.map((message) => ({role: 'user', content: message.content}));

  const completion = await openai.chat.completions.create({
    messages: [
      {role: 'system', content: 'The following shows part of a discussion between three participants on the topic: "Students are not allowed to use AI technology for their exams" in the JSON format { name: {name}, message: {message}}. Note the contribution in percentages of all participants in the format: {name: [name of participant], percentage: [percentage of contribution]}'},
      ...formattedMessages,
    ],
    model: 'gpt-4',
  }); 

  const contributionResult = completion.choices[0].message;
  console.log('Equal contribution', messages[messages.length - 1].id, contributionResult);

}