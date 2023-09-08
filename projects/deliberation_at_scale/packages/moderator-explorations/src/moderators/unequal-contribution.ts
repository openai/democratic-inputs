import OpenAI from 'openai';
import Message from '../types/message';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import allContributedCheck from './checks/all-contributed-check';
import ModeratorOutput from '../types/moderatorOutput';

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

export default async function unequalContribution(messages: Message[]) {

  //TODO: Add a check whether it has been < 5 min since topic start and remove the check below

  //Check if all participants have contributed in the conversation
  const allContributed = await allContributedCheck(messages);

  //Check for unequal contribution
  if (allContributed) {
    const unequalContributionCheckResult = await unequalContributionCheck(messages);

    //Provide a response as the moderator to the unequal contribution
    if (unequalContributionCheckResult?.result) {
      const moderatorOutput = await unequalContributionMessage(messages);

      return moderatorOutput;
    } else {
      return null;
    }

  } 

  

}

async function unequalContributionCheck(messages: Message[]) {
  const formattedMessages: Array<ChatCompletionMessageParam> = messages.map((message) => ({ role: 'user', content: JSON.stringify(message) }));

  const completion = await openai.chat.completions.create({
    temperature: 0.2,
    messages: [

      {
        role: 'user', content: `The following shows part of a transcript of a discussion between three participants. 
    The transcript is written in the following JSON format { id: id, "name": "name", "message": "message"}. 
    

    You are a moderator of the discussion and you make sure that everyone is contributing their views equally in the discussion.
    If you feel like there is unequal contribution and an interruption from the moderator is needed say true, otherwise say false.

    If interruption is needed, also provide your interruption message. Or null when no interruption is needed.

    Return a JSON objct in the following format: { result: {boolean, true/false}}
    ` },
      ...formattedMessages,
    ],
    model: 'gpt-4',
  });

  const completionResult = completion.choices[0].message.content;

  if (completionResult == null) {
    return null;
  }

  const result = JSON.parse(completionResult);
  console.log();
  
  return result;

}

async function unequalContributionMessage(messages: Message[]): Promise<ModeratorOutput | null>  {
  const formattedMessages: Array<ChatCompletionMessageParam> = messages.map((message) => ({ role: 'user', content: message.content }));

  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'user', content: `There is a discussion between 3 people. They all send a prompt to this chat in the following JSON format:  { id: id, "name": "name", "message": "message"}.
      
      You are a moderator in the discussion and the participants and are interrupting the discussion as not everyone is equally contributing to the conversation in max 20 words.
      
      return a JSON object in the following format: { content: {the moderator response}` 
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
    type: "unequalContribution",
    message: result.content
  }

  console.log(outputMessage);

  return outputMessage;
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