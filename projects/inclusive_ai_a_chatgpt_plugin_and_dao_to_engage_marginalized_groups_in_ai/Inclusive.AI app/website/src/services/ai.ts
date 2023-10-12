import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from '@/services'
import { ChatDialogue, UserChatResponse } from '@/types'

export const aiApi = createApi({
  reducerPath: 'aiApi',
  baseQuery,
  refetchOnMountOrArgChange: 0,
  endpoints: (builder) => ({
    postAiChat: builder.mutation<
      { connection: string; dialogue: ChatDialogue }, // response body
      {
        appPubkey: string
        connection: string
        dialogue: ChatDialogue
        location: string
      } // request body
    >({
      query: (body) => ({
        url: 'ai/chat',
        method: 'POST',
        body,
      }),
    }),

    getAiChatHistory: builder.query<
      {
        error: any
        payload: { connection: string; chatHistory: UserChatResponse[] } | null
      }, // response body
      { appPubkey: string; connection: string } // request body
    >({
      query: (params) => ({
        url: 'ai/chat-history',
        method: 'GET',
        params,
      }),
    }),
  }),
})

export const { useGetAiChatHistoryQuery, usePostAiChatMutation } = aiApi
