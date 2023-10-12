import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '@/store'
import type { ChatDialogue } from '@/types'
import { aiApi } from '@/services/ai'
import { discussApi } from '@/services/discuss'

export interface ChatState {
  history: Record<string, ChatDialogue[]> // mapping of channel => messages history
}

// Define the initial state using that type
const initialState: ChatState = {
  history: {},
}

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearMessages: (state, action: PayloadAction<string>) => {
      if (action.payload in state.history) state.history[action.payload] = []
    },
    addMessages: (
      state,
      action: PayloadAction<{
        connection: string | undefined
        messages: ChatDialogue[]
      }>,
    ) => {
      // MessageEvent<any>.data
      const { connection } = action.payload
      if (!connection) return

      // Initialize history for channel if it doesn't exist
      if (!state.history) state.history = {}
      if (!state.history[connection]) state.history[connection] = []

      // Add message to history
      state.history[connection] = state.history[connection].concat(
        action.payload.messages,
      )
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      aiApi.endpoints.postAiChat.matchFulfilled,
      (state, action) => {
        // console.log('postAiChat matchFulfilled', action.payload)
        const connection = action.payload.connection as string
        const dialogue = action.payload.dialogue as ChatDialogue
        if (dialogue) {
          // if not `null` (no error)
          state.history[connection] = [...state.history[connection], dialogue]
        }
      },
    )

    builder.addMatcher(
      aiApi.endpoints.getAiChatHistory.matchFulfilled,
      (state, action) => {
        if (!!action.payload.error || !action.payload.payload) return

        const { connection, chatHistory } = action.payload.payload

        // chatHistory.reverse().map()
        const parsedChatHistory = chatHistory.map((chat) => {
          const userDialogue: ChatDialogue = {
            content: chat.text,
            role: 'user',
            createdAt: chat.createdAt,
          }
          if (!chat.aiResponse) return [userDialogue]

          const aiDialogue: ChatDialogue = {
            content: chat.aiResponse.text,
            role: 'assistant',
            createdAt: chat.createdAt,
          }
          return [userDialogue, aiDialogue]
        })

        state.history[connection] = parsedChatHistory.flat()
      },
    )

    builder.addMatcher(
      discussApi.endpoints.getDiscussChatHistory.matchFulfilled,
      (state, action) => {
        if (!!action.payload.error || !action.payload.payload) return

        const { connection, chatHistory } = action.payload.payload

        // have to reverse the chat history because the backend returns the latest chat first
        const parsedChatHistory = chatHistory.reverse().map(
          (chat) =>
            ({
              content: chat.text,
              role: 'user',
              createdAt: chat.createdAt,
              tag: chat.tag,
            }) as ChatDialogue,
        )
        // console.log('connection', connection, 'chat history', parsedChatHistory)

        state.history[connection] = parsedChatHistory.flat()
      },
    )
  },
})

export const { addMessages, clearMessages } = chatSlice.actions

export const selectMessageHistory =
  (channel: string | undefined) => (state: RootState) =>
    channel && state.chat.history ? state.chat.history[channel] ?? [] : []

export default chatSlice.reducer
