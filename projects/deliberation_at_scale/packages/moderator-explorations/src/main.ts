require("dotenv").config();
import messages from './chats/example_chat';
import Message from './types/message';
import badLanguage from './moderators/bad-language';

async function main(messages: Message[], messagesCount: number) {
  const messagesForModeration = messages.slice(0, messagesCount);

  moderator(messagesForModeration);

  if(messagesCount < messages.length) {
    const nextCount = messagesCount + 1;
    main(messages, nextCount);
  }
}

async function moderator(messages: Message[]) {
  console.log('Run moderation for amount of messages: ', messages.length);
  const lastMessage = messages[messages.length - 1];
  // badLanguage(lastMessage);
}

main(messages, 1);