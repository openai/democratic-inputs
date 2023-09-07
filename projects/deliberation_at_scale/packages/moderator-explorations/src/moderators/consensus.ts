import OpenAI from 'openai';
import Message from '../types/message';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import allContributedCheck from './checks/all-contributed-check';
import ModeratorOutput from '../types/moderatorOutput';

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

export default async function consensus(messages: Message[]) {
  //TODO: if there are 0 messages, do not do the consensus check.

  //Check if all participants have contributed in the conversation
  const allContributed = await allContributedCheck(messages);

  if (allContributed) {
    //Check if a consensus has been found
    const consensusCheckResult = await consensusCheck(messages);

    //Summarize the consensus in 20 words if a consensus was found
    if (consensusCheckResult?.result) {
      const moderatorOutput = await consensusMessage(messages);

      return moderatorOutput;
    } else {
      return null;
    }
  }
}

async function consensusCheck(messages: Message[]): Promise<{result: boolean} | null> {
  const formattedMessages: Array<ChatCompletionMessageParam> = messages.map((message) => ({ role: 'user', content: message.content }));

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: 'user', content: `The following shows part of a discussion at this point in the discussion do the three participants have a consensus on the topic: "Students are not allowed to use AI technology for their exams"? 
     
      return a JSON object in the following format: { result: {boolean, true if there is a consensus} }
      If yes say true if no say false.` },
      ...formattedMessages,
    ],
    model: 'gpt-4',
  });

  const completionResult = completion.choices[0].message.content;

  if (completionResult == null) {
    return null;
  }

  const result = JSON.parse(completionResult);

  return result;
}

async function consensusMessage(messages: Message[]): Promise<ModeratorOutput | null>  {
  const formattedMessages: Array<ChatCompletionMessageParam> = messages.map((message) => ({ role: 'user', content: message.content }));

  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'user', content: `The following shows part of a discussion between three participants on the topic: 
      "Students are not allowed to use AI technology for their exams"?. 
      Output the consensus as a statement in less than 20 words.
      
      return a JSON object in the following format: { content: {the consensus statement}` 
    },
      ...formattedMessages,
    ],
    model: 'gpt-4',
  });

  const completionResult = completion.choices[0].message.content;
  
  if (completionResult == null) {
    return null;
  }

  const result = JSON.parse(completionResult);

  const outputMessage = {
    type: "consensus",
    message: result.content
  }

  return outputMessage;
}

