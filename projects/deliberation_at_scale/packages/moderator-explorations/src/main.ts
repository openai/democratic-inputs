require("dotenv").config();
import messages from './chats/example_chat';
import Message from './types/message';
import consensus from './moderators/consensus';
import unequalContribution from './moderators/unequal-contribution';

async function main(messages: Message[], messagesCount: number) {
  const messagesForModeration = messages.slice(0, messagesCount);

  moderator(messagesForModeration);

  if(messagesCount < messages.length) {
    const nextCount = messagesCount + 1;
    main(messages, nextCount);
  }
}

async function moderator(messages: Message[]) {

  const lastMessage = messages[messages.length - 1];

  //DIFFICULT LANGUAGE
  //const difficultLanguageMessage = await difficultLanguage(lastMessage);
  //console.log(difficultLanguageMessage);

  // CONSENSUS
  //const consensusMessage = await consensus(messages);
  //console.log(consensusMessage)

  //  UNEQUAL CONTRIBUTION
  //const contributionCheckMessagesCount = 5; // Amount of messages that are used to compare the contribution between participants.
  //const contributionMessages = (messages.length <= contributionCheckMessagesCount) ? messages : messages.slice((messages.length - contributionCheckMessagesCount - 1), messages.length - 1);
  //unequalContribution(contributionMessages);

}

main(messages, 1);