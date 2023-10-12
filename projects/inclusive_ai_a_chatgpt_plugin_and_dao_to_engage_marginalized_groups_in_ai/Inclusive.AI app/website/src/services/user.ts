import { createApi } from '@reduxjs/toolkit/query/react'
// import { HYDRATE } from 'next-redux-wrapper'

import { baseQuery } from '@/services'
import type { UserExtendedData } from '@/types/user'

export type ApiResponse<T = any> =
  | { error: string; payload: null }
  | { error: null; payload: T }

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery,
  refetchOnMountOrArgChange: true, // for appPubkey
  //
  // Note: Do not rehydrate the userApi slice reducer. This will cause the api cache to be restored, which might be
  // stuck when fetching state.
  //
  // `extractRehydrationInfo`: https://redux-toolkit.js.org/rtk-query/usage/server-side-rendering#server-side-rendering-with-nextjs
  // extractRehydrationInfo(action, { reducerPath }) {
  //   if (action.type === HYDRATE) {
  //     return action.payload[reducerPath]
  //   }
  // },
  endpoints: (builder) => ({
    getUser: builder.query<
      ApiResponse<UserExtendedData>,
      string // appPubkey
    >({
      // User is auto-parsed by server using the JWT token in the Headers
      // (passed in from the custom extended `baseQuery`)
      query: (appPubkey: string) => ({
        url: 'user',
        params: { appPubkey },
      }),
    }),

    preInitUser: builder.mutation<
      ApiResponse,
      {
        name: string // user's display name
        role: string // user's role (`participant` or `admin`)
        userId: string // user's email
        appPubkey: string
        address: string
      }
    >({
      query: (body) => ({
        url: 'user/pre',
        method: 'POST',
        body,
      }),
    }),

    createUser: builder.mutation<
      ApiResponse,
      {
        name: string
        role: string
        userId: string
        appPubkey: string
        address: string
      }
    >({
      query: (
        // body: Omit<UserProfile, 'user'> & {
        //   name: string // user's display name
        //   role: string // user's role (`participant` or `admin`)
        //   userId: string // user's email
        //   appPubkey: string
        //   address: string
        // },
        body,
      ) => ({
        url: 'user',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const {
  useCreateUserMutation,
  useGetUserQuery,
  usePreInitUserMutation,
} = userApi
