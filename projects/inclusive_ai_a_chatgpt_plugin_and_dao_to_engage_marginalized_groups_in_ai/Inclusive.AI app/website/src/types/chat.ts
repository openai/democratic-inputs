export type UserChatResponse = {
  id: number

  text: string

  // user's connection id, e.g. sha256(user_email + chat_location)
  // connection: string

  createdAt: number

  // user: User

  aiResponse: UserChatAiResponse
}

export type UserChatAiResponse = {
  id: number

  text: string

  connection: string

  createdAt: number

  // chat: Chat
}
