import OpenAI from 'openai';
import Message from '../types/message';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import allContributedCheck from './checks/all-contributed-check';

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

export default async function consensus(messages: Message[]) {
  //TODO: if there are 0 messages, do not do the consensus check.

  //Check if all participants have contributed in the conversation
  const allContributed = await allContributedCheck(messages);

  if (allContributed) {
    //Check if a consensus has been found
    const consensusFound = await consensusCheck(messages);

    //Summarize the consensus in 20 words if a consensus was found
    if (consensusFound) {
      const consensusMessage = await consensusContent(messages);
      console.log("The consensus is: ", consensusMessage);

      //TODO: Output the conensus to the chat
    }
  }


}

async function consensusCheck(messages: Message[]) {
  const formattedMessages: Array<ChatCompletionMessageParam> = messages.map((message) => ({ role: 'user', content: message.content }));

  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'user', content: 'The following shows part of a discussion at this point in the discussion do the three participants have a consensus on the topic: "Students are not allowed to use AI technology for their exams"? If yes say true if no say false.' },
      ...formattedMessages,
    ],
    model: 'gpt-4',
  });

  const consensusFound = completion.choices[0].message.content == "True" ? true : false;
  //console.log('Consensus check result: ', messages[messages.length - 1].id, consensusFound);

  return consensusFound;
}

async function consensusContent(messages: Message[]) {
  const formattedMessages: Array<ChatCompletionMessageParam> = messages.map((message) => ({ role: 'user', content: message.content }));

  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'user', content: 'The following shows part of a discussion between three participants on the topic: "Students are not allowed to use AI technology for their exams"?. Output the consensus as a statement in less than 20 words.' },
      ...formattedMessages,
    ],
    model: 'gpt-4',
  });

  const consensusMessage = completion.choices[0].message.content;
  //console.log('Consensus check result: ', messages[messages.length - 1].id, consensusMessage);

  return consensusMessage;
}

