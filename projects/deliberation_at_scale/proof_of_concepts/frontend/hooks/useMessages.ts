import { useEffect, useState } from "react";

import { supabase } from "@/utilities/supabase";
import useAuth from "./useAuth";

export default function useMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    supabase.from('messages').select('*').then((messageResult) => {
      const { data: messages } = messageResult;

      if (!messages) {
        return;
      }

      setMessages(messages);
    });
    const messageInsertListener = supabase.channel('supabase_realtime').on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
    }, (payload) => {
      console.log('message inserted: ', payload);
    }).subscribe();

    return () => {
      messageInsertListener.unsubscribe();
    };
  }, [user]);

  return {
    messages,
  };
}
