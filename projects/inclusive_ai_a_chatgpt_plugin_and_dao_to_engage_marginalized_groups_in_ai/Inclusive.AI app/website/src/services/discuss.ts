import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from '@/services'
import { UserChatResponse } from '@/types'

export const discussApi = createApi({
  reducerPath: 'discussApi',
  baseQuery,
  refetchOnMountOrArgChange: 0,
  endpoints: (builder) => ({
    getDiscussChatHistory: builder.query<
      {
        error: any
        payload: {
          connection: string
          chatHistory: (UserChatResponse & { tag: string })[]
        } | null
      }, // response body
      { appPubkey: string } // request body
    >({
      query: (params) => ({
        url: 'discuss/chat-history',
        method: 'GET',
        params,
      }),
    }),
  }),
})

export const { useGetDiscussChatHistoryQuery } = discussApi
