export type UserProfileAgeRange =
  | 'under_18'
  | '18_24'
  | '25_34'
  | '45_54'
  | '55_64'
  | '65_up'

export enum UserProfileGenderIdentity {
  MALE,
  FEMALE,
  NON_BINARY,
  PREFER_NO_DISCLOSE,
  OTHER,
}

export enum UserProfileEthnicBackground {
  WHITE_CAUCASIAN,
  BLACK_AFRICAN_AMERICAN,
  ASIAN_ASIAN_AMERICAN,
  HISPANIC_LATINO_LATINA,
  NATIVE_AMERICAN_INDIGENOUS,
  PACIFIC_ISLANDER,
  MIXED_RACE,
  OTHER,
}

export enum UserProfileEducationLevel {
  LESS_THAN_HIGH_SCHOOL,
  HIGH_SCHOOL_OR_EQUIVALENT,
  SOME_COLLEGE_OR_VOCATIONAL,
  BACHELOR,
  MASTER,
  DOCTORATE_OR_PROFESSIONAL,
}

export enum UserProfileEmploymentStatus {
  FULLTIME,
  PARTTIME,
  UNEMPLOYED,
  STUDENT,
  RETIRED,
  OTHER,
}

export enum UserProfileDeviceUsageFrequency {
  FREQUENTLY,
  OCCASIONALLY,
  RARELY,
  NEVER,
}

export enum UserProfileHouseholdIncome {
  UNDER_20K,
  BTW_20_40K,
  BTW_40_60K,
  BTW_60_80K,
  OVER_100K,
}

export type UserProfilePrimaryLanguage = 'English' | 'Other'
