import { ValueQuestion } from '@/types/pod'
import * as pt from '@/types/profile'

export type UserRole = 'admin' | 'observer' | 'participant'

export type UserData = {
  id: string
  name: string
  role: UserRole
}

export type UserExtendedData = {
  user: UserData & {
    appPubkey: string
    address: string
    votingTokenReceivedBlockNumber: number
    votingEarly: boolean
    aiSurveyCompleted: boolean
  }
  pod: UserPod
  profile: UserProfile
}

export type UserPod = {
  createdAt: string
  id: number
  isActive: boolean
  name: string
  slug: string
  valueQuestion: ValueQuestion[]
}

export type UserProfile = {
  ageRange: pt.UserProfileAgeRange
  genderIdentity: pt.UserProfileGenderIdentity
  genderIdentityOther?: string
  ethnicBackground: pt.UserProfileEthnicBackground
  ethnicBackgroundOther?: string
  countryResideIn: string
  isEnrolledInEducation: boolean
  highestLevelEducation: pt.UserProfileEducationLevel
  employmentStatus: pt.UserProfileEmploymentStatus
  employmentStatusOther?: string
  deviceUsageFrequency: pt.UserProfileDeviceUsageFrequency
  householdIncome: pt.UserProfileHouseholdIncome
  primaryLanguage: pt.UserProfilePrimaryLanguage
  primaryLanguageOther?: string
  // fromGlobalSouth: boolean
  studyHear: string
}
