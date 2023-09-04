import { useEffect, useState } from "react"
import { alphabetical } from "radash"

import useAuth from "./useAuth"
import { supabase } from "@/state/supabase"
import { Database } from "@/types/database"

type Message = Database["public"]["Tables"]["messages"]["Row"]

export default function useMessages() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const orderedMessages = alphabetical(
    messages,
    (message) => message.created_at,
    "asc"
  )
  const fetchMessages = () => {
    supabase
      .from("messages")
      .select("*")
      .then((messageResult) => {
        const { data: messages } = messageResult

        // guard: skip when invalid messages
        if (!messages) {
          return
        }

        setMessages(messages)
      })
  }
  const appendMessage = (message: Message) => {
    setMessages((messages) => {
      return [...messages, message]
    })
  }

  const updateMessage = (updatedMessage: Message) => {
    setMessages((messages) => {
      return messages.map((message) =>
        message.id === updatedMessage.id ? updatedMessage : message
      )
    })
  }

  useEffect(() => {
    fetchMessages()

    const messageInsertListener = supabase
      .channel("supabase_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMessage = payload.new as Message

          appendMessage(newMessage)
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const updatedMessage = payload.new as Message

          updateMessage(updatedMessage)
        }
      )
      .subscribe()

    return () => {
      messageInsertListener.unsubscribe()
    }
  }, [user])

  return {
    messages: orderedMessages,
  }
}
