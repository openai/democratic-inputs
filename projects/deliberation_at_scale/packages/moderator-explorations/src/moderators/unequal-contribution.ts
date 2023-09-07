import OpenAI from 'openai';
import Message from '../types/message';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import allContributedCheck from './checks/all-contributed-check';

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

export default async function unequalContribution(messages: Message[]) {

  //TODO: Add a check whether it has been < 5 min since topic start and remove the check below

  //Check if all participants have contributed in the conversation
  const allContributed = await allContributedCheck(messages);

  //Check for equal contribution
  if (allContributed) equalContributionCheck(messages);

}

async function equalContributionCheck(messages: Message[]) {
  const formattedMessages: Array<ChatCompletionMessageParam> = messages.map((message) => ({ role: 'user', content: JSON.stringify(message) }));

  const completion = await openai.chat.completions.create({
    temperature: 0.2,
    messages: [

      {
        role: 'user', content: `The following shows part of a transcript of a discussion between three participants. 
    The transcript is written in the following JSON format { id: id, "name": "name", "message": "message"}. 
    
    You are a moderator of the discussion, is everyone expressing their views equally? 
    
    If yes say true if no say false.
    
    Reply in the following JSON object { result: "boolean, true if message does not pass the check" }
    ` },
      ...formattedMessages,
    ],
    model: 'gpt-4',
  });

  const contributionResult = completion.choices[0].message.content;
  console.log(contributionResult);
  //const checkResult = JSON.parse(contributionResult);

 
  //console.log('Equal contribution', messages[messages.length - 1].id, contributionResult);

}


//Can be used to check the percentages of equal contribution
async function equalContributionCheckPercentages(messages: Message[]) {
  const formattedMessages: Array<ChatCompletionMessageParam> = messages.map((message) => ({ role: 'user', content: JSON.stringify(message) }));

  const completion = await openai.chat.completions.create({
    temperature: 0,
    messages: [
      { role: 'system', content: 'The following shows part of a transcript of a discussion between three participant. The transcript is written in the following JSON format { id: id, "name": "name of the participant", "message": "message"}. Please indicate in percentages how much each of the participants have expressed their view in the discussion in whole numbers in the following JSON Object {name of participant 1: percentage, name of participant 2: percentage, name of participant 3: percentage}' },
      ...formattedMessages,
    ],
    model: 'gpt-4',
  });

  const contributionResult = completion.choices[0].message.content;
  console.log('Equal contribution', messages[messages.length - 1].id, contributionResult);
}