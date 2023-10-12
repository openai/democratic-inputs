import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '@/store'
import * as pt from '@/types/profile'
import type { UserExtendedData, UserPod, UserProfile } from '@/types/user'
import { userApi } from '@/services/user'
import { surveyApi } from '@/services/survey'

export interface UserState {
  user: UserExtendedData['user']
  pod: UserPod
  profile: UserProfile
}

// Define the initial state using that type
const initialState: UserState = {
  user: {
    id: '',
    name: '',
    role: 'participant',
    appPubkey: '',
    address: '',
    votingTokenReceivedBlockNumber: 0,
    votingEarly: false,
    aiSurveyCompleted: false,
  },
  pod: {
    id: 0,
    name: '',
    slug: '',
    valueQuestion: [],
    createdAt: '0',
    isActive: false,
  },
  profile: {
    ageRange: 'under_18',
    genderIdentity: pt.UserProfileGenderIdentity.OTHER,
    ethnicBackground: pt.UserProfileEthnicBackground.OTHER,
    countryResideIn: '',
    isEnrolledInEducation: false,
    highestLevelEducation: pt.UserProfileEducationLevel.BACHELOR,
    employmentStatus: pt.UserProfileEmploymentStatus.OTHER,
    deviceUsageFrequency: pt.UserProfileDeviceUsageFrequency.FREQUENTLY,
    householdIncome: pt.UserProfileHouseholdIncome.OVER_100K,
    primaryLanguage: 'English',
    // fromGlobalSouth: false,
    studyHear: '',
  },
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateUserProfile: (state, action: PayloadAction<UserProfile>) => {
      // Use spread operator to not erase any existing fields
      state.profile = action.payload
    },
  },
  extraReducers: (builder) => {
    // update user data on `getUser` fetch is successful
    builder.addMatcher(
      userApi.endpoints.getUser.matchFulfilled,
      (state, action) => {
        if (action.payload.error) return

        const userData = action.payload.payload
        if (!userData) return

        // console.log(userData.user, state)

        state.user.address = userData.user.address
        state.user.id = userData.user.id

        state.user.votingEarly = userData.user.votingEarly
        state.user.votingTokenReceivedBlockNumber =
          userData.user.votingTokenReceivedBlockNumber
        // console.log('userData.user.aiSurveyCompleted', userData.user.aiSurveyCompleted)
        state.user.aiSurveyCompleted = userData.user.aiSurveyCompleted
        state.pod = userData.pod
        // state.profile = userData.profile
      },
    )

    // update user data on `postSurveyAi` fetch is successful
    builder.addMatcher(
      surveyApi.endpoints.postSurveyAi.matchFulfilled,
      (state, action) => {
        if (!action.payload) return
        state.user.aiSurveyCompleted = true
      },
    )
  },
})

export const { updateUserProfile } = userSlice.actions

export const selectUserData = (state: RootState) => state.user
export const selectUser = (state: RootState) => state.user.user
export const selectUserPod = (state: RootState) => state.user.pod
export const selectUserProfile = (state: RootState) => state.user.profile

export default userSlice.reducer
