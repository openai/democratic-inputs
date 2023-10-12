import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from '@/services'
import type { ApiResponse } from '@/services/user'

export const surveyApi = createApi({
  reducerPath: 'surveyApi',
  baseQuery,
  endpoints: (builder) => ({
    postSurveyAi: builder.mutation<
      ApiResponse<boolean>, // response body
      { survey: any; appPubkey: string } // request body
    >({
      query: (body) => ({
        url: 'survey/ai',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const { usePostSurveyAiMutation } = surveyApi
