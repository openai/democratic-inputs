import { createApi } from '@reduxjs/toolkit/query/react'
// import { HYDRATE } from 'next-redux-wrapper'

import { baseQuery } from '@/services'
import { ApiResponse } from '@/services/user'

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery,
  refetchOnMountOrArgChange: true, // for appPubkey
  endpoints: (builder) => ({
    mintTokens: builder.mutation<ApiResponse, { appPubkey: string }>({
      query: (body) => ({
        url: 'admin/mint-tokens',
        method: 'POST',
        body,
      }),
    }),

    createProposals: builder.mutation<ApiResponse, { appPubkey: string }>({
      query: (body) => ({
        url: 'admin/create-proposals',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const { useCreateProposalsMutation, useMintTokensMutation } = adminApi
