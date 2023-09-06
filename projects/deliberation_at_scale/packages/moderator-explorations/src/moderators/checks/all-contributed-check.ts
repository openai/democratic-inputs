import Message from '../../types/message';

export default async function allContributedCheck(messages: Message[]) {

    //Check if all participants have contributed in the conversation
    const names = messages.map((message) => message.name);
    const uniqueNames = Array.from(new Set(names)).length;
    const allContributed = (uniqueNames == 3) ? true : false;

    return allContributed;
  }