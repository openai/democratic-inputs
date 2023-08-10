'use client';
import { isEmpty } from 'radash';
import { useEffect, useRef, useState } from 'react';

import useMessages from '@/hooks/useMessages';
import { supabase } from '@/utilities/supabase';

export default function Messages() {
  const { messages } = useMessages();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasMessages = !isEmpty(messages);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  };
  const sendMessage = async () => {
    const formattedMessage = message.trim();

    // guard: check if the message is valid
    if (isEmpty(formattedMessage)) {
      return;
    }

    // send the message and clear the form
    await supabase.from('messages').insert({
      content: formattedMessage,
    });
    setMessage('');
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <div className="w-full p-10 max-w-4xl">
      <div className="w-full h-[calc(100vh-200px)] overflow-y-scroll overflow-x-hidden animate-in flex flex-col gap-14 opacity-0 px-3 py-16 lg:py-24 text-foreground rounded-lg border m-auto">
        {!hasMessages && (
          <h2>No messages</h2>
        )}
        {messages.map((message) => {
          const { id, content } = message;

          return (
            <div key={id}>{content}</div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="w-full h-[40px] rounded-lg border m-auto">
        <form onSubmit={(event) => {
          event.preventDefault();
          sendMessage();
        }}>
          <input
            className="w-full rounded-md px-4 py-2 bg-inherit text-white mb-6"
            name="message"
            placeholder="Write down what you think..."
            required
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
            }}
          />
        </form>
      </div>
    </div>
  );
}
