import { fetchBaseQuery } from '@reduxjs/toolkit/dist/query'

import { RootState } from '@/store'

export const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState
    const { jwtToken } = state.app.user

    if (jwtToken) headers.set('Authorization', `Bearer ${jwtToken}`)

    return headers
  },
  credentials: 'include', // allows server to set cookies
})
