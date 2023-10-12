import { Web3Provider } from '@ethersproject/providers'
import { Box } from '@mui/material'
import { useRouter } from 'next/router'
import { useCallback, useEffect } from 'react'
import { useTracking } from 'react-tracking'

import { Form as QuillForm, useFieldAnswer } from '@quillforms/renderer-core'
import '@quillforms/renderer-core/build-style/style.css'
import { SubmissionDispatchers } from '@quillforms/renderer-core/build-types/types'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { registerCoreBlocks } from '@quillforms/react-renderer-utils'
registerCoreBlocks()

import { useAppDispatch, useWeb3Auth } from '@/hooks'
import { useCreateUserMutation, usePreInitUserMutation } from '@/services/user'
import { updateUserProfile } from '@/slices/user'
import * as pty from '@/types/profile'
import { allCountriesQuilFormatted } from '@/data/countries'

export default function IntroPage() {
  useTracking({ page: 'Intro' })

  const web3Auth = useWeb3Auth()
  const dispatch = useAppDispatch()
  const router = useRouter()

  const [createUser] = useCreateUserMutation()
  const [preInitUser] = usePreInitUserMutation()

  const genderIdentityAnswer = useFieldAnswer('gender-identity')
  const ethnicBackgroundAnswer = useFieldAnswer('ethnic-background')
  const employmentStatusAnswer = useFieldAnswer('employment-status')
  const primaryLanguageAnswer = useFieldAnswer('primary-language')

  const handleSubmitProfile = useCallback(
    async (
      data: any,
      {
        completeForm,
        setIsSubmitting,
        // goToBlock,
        setSubmissionErr,
      }: SubmissionDispatchers,
    ) => {
      setSubmissionErr('')
      if (
        !web3Auth ||
        !web3Auth.user ||
        !web3Auth.provider ||
        !data ||
        !data.answers
      )
        return

      try {
        const newProfileData = {
          ageRange: data.answers['age-range'].value[0],
          countryResideIn: data.answers['country-reside-in-in'].value,
          deviceUsageFrequency: pty.UserProfileDeviceUsageFrequency[
            data.answers['device-usage-frequency'].value[0]
          ] as unknown as pty.UserProfileDeviceUsageFrequency,
          highestLevelEducation: pty.UserProfileEducationLevel[
            data.answers['education-level'].value[0]
          ] as unknown as pty.UserProfileEducationLevel,
          employmentStatus: pty.UserProfileEmploymentStatus[
            data.answers['employment-status'].value[0]
          ] as unknown as pty.UserProfileEmploymentStatus,
          ethnicBackground: pty.UserProfileEthnicBackground[
            data.answers['ethnic-background'].value - 1 // we need to subtract 1 because the index starts at 0 (we incremented by 1 for option)
          ] as unknown as pty.UserProfileEthnicBackground,
          genderIdentity: pty.UserProfileGenderIdentity[
            data.answers['gender-identity'].value[0]
          ] as unknown as pty.UserProfileGenderIdentity,
          householdIncome: pty.UserProfileHouseholdIncome[
            data.answers['household-income'].value[0]
          ] as unknown as pty.UserProfileHouseholdIncome,
          isEnrolledInEducation: Boolean(data.answers['in-education'].value[0]),
          primaryLanguage: data.answers['primary-language'].value[0],
          studyHear: data.answers['study-hear'].value || '',
        }

        if (
          Object.values(newProfileData).filter((x) => typeof x === 'undefined')
            .length > 0
        ) {
          throw new Error('Missing required or invalid data of field')
        }

        const employmentStatusOther = data.answers['employment-status-other']
          ? data.answers['employment-status-other'].value
          : null
        const ethnicBackgroundOther = data.answers['ethnic-background-other']
          ? data.answers['ethnic-background-other'].value
          : null
        const primaryLanguageOther = data.answers['primary-language-other']
          ? data.answers['primary-language-other'].value
          : null

        if (
          newProfileData.employmentStatus ===
            pty.UserProfileEmploymentStatus.OTHER &&
          !employmentStatusOther
        ) {
          throw new Error('Invalid employment status other')
        }

        if (
          newProfileData.ethnicBackground ===
            pty.UserProfileEthnicBackground.OTHER &&
          !ethnicBackgroundOther
        ) {
          throw new Error('Invalid ethnic background other')
        }

        if (
          newProfileData.primaryLanguage === 'Other' &&
          !primaryLanguageOther
        ) {
          throw new Error('Invalid primary language other')
        }

        try {
          const userAddress = await new Web3Provider(web3Auth.provider)
            .getSigner()
            .getAddress()

          const res = await createUser({
            ...newProfileData,
            name: web3Auth.user.name || web3Auth.user.email || 'n/a',
            role: 'participant',
            userId: web3Auth.user.email || '',
            appPubkey: web3Auth.user.appPubkey || '',
            address: userAddress,
          })
          console.log(res)

          if ('error' in res) {
            // addToast('Uh oh something bad happened!')
            throw new Error('Error while creating user')
          } else {
            dispatch(updateUserProfile(newProfileData))
            completeForm()
            // setTimeout(() => router.replace({ pathname: '/', query: router.query }), 2000)
            setTimeout(() => router.reload(), 3000)
          }
        } catch (err) {
          console.error(err)
          throw err
        }
      } catch (err) {
        console.log(err)
        throw err
        // throw new Error('Missing required or invalid data of field')
      } finally {
        setIsSubmitting(false)
        setSubmissionErr('Invalid form data received')
      }
    },
    [createUser, dispatch, router, web3Auth],
  )

  useEffect(() => {
    if (!web3Auth || !web3Auth.user || !web3Auth.provider) return

    const preInitUserFn = async () => {
      try {
        if (!web3Auth || !web3Auth.user || !web3Auth.provider) return

        const userAddress = await new Web3Provider(web3Auth.provider)
          .getSigner()
          .getAddress()

        const res = await preInitUser({
          name: web3Auth.user.name || web3Auth.user.email || 'n/a',
          role: 'participant',
          userId: web3Auth.user.email || '',
          appPubkey: web3Auth.user.appPubkey || '',
          address: userAddress,
        })

        console.log(res)
      } catch (err) {
        console.error(err)
      }
    }

    preInitUserFn()
  }, [preInitUser, web3Auth])

  return (
    <Box height="100%" width="100%" sx={{ margin: '0 !important' }}>
      <QuillForm
        formId={1}
        formObj={{
          blocks: [
            {
              name: 'welcome-screen',
              id: 'intro-welcome-screen',
              attributes: {
                label: 'Welcome to <strong>Inclusive AI</strong> 👋',
                description:
                  'Fill out a short form to help us tailor the experience around YOU!',
                attachment: {
                  type: 'image',
                  url: 'https://quillforms.com/wp-content/uploads/2022/01/4207-ai-1.jpeg',
                },
              },
            },
            {
              name: 'multiple-choice',
              id: 'age-range',
              attributes: {
                required: true,
                multiple: false,
                verticalAlign: true,
                label: "Let's start with your age range",
                choices: [
                  { label: '18 to 24', value: '18_24' },
                  { label: '25 to 34', value: '25_34' },
                  { label: '35 to 44', value: '35_44' },
                  { label: '45 to 54', value: '45_54' },
                  { label: '55 to 64', value: '55_64' },
                  { label: '65 or above', value: '65_up' },
                ],
              },
            },
            {
              name: 'multiple-choice',
              id: 'gender-identity',
              attributes: {
                required: true,
                multiple: false,
                verticalAlign: true,
                label: 'What gender do you identify as?',
                choices: [
                  { label: 'Male', value: pty.UserProfileGenderIdentity.MALE },
                  {
                    label: 'Female',
                    value: pty.UserProfileGenderIdentity.FEMALE,
                  },
                  {
                    label: 'Non-binary',
                    value: pty.UserProfileGenderIdentity.NON_BINARY,
                  },
                  {
                    label: 'Prefer not to disclose',
                    value: pty.UserProfileGenderIdentity.PREFER_NO_DISCLOSE,
                  },
                  {
                    label: 'Other',
                    value: pty.UserProfileGenderIdentity.OTHER,
                  },
                ],
              },
            },
            ...(typeof genderIdentityAnswer !== 'undefined' &&
            (genderIdentityAnswer as number[])[0] ===
              pty.UserProfileGenderIdentity.OTHER
              ? [
                  {
                    name: 'short-text',
                    id: 'gender-identity-other',
                    attributes: {
                      label: 'Please specify your gender',
                    },
                  },
                ]
              : []),
            {
              name: 'dropdown',
              id: 'ethnic-background',
              attributes: {
                required: true,
                label: 'What is your ethnic background?',
                choices: [
                  // Increment value by 1 because QuillForms doesn't allow 0 as a valid value,
                  // which is `WHITE_CAUCASIAN` in `UserProfileEthnicBackground`
                  {
                    label: 'White Caucasian',
                    value: pty.UserProfileEthnicBackground.WHITE_CAUCASIAN + 1,
                  },
                  {
                    label: 'Black/African American',
                    value:
                      pty.UserProfileEthnicBackground.BLACK_AFRICAN_AMERICAN +
                      1,
                  },
                  {
                    label: 'Asian/Asian American',
                    value:
                      pty.UserProfileEthnicBackground.ASIAN_ASIAN_AMERICAN + 1,
                  },
                  {
                    label: 'Hispanic/Latino/Latina',
                    value:
                      pty.UserProfileEthnicBackground.HISPANIC_LATINO_LATINA +
                      1,
                  },
                  {
                    label: 'Native American/Indigenous',
                    value:
                      pty.UserProfileEthnicBackground
                        .NATIVE_AMERICAN_INDIGENOUS + 1,
                  },
                  {
                    label: 'Pacific Islander',
                    value: pty.UserProfileEthnicBackground.PACIFIC_ISLANDER + 1,
                  },
                  {
                    label: 'Mixed Race',
                    value: pty.UserProfileEthnicBackground.MIXED_RACE + 1,
                  },
                  {
                    label: 'Other',
                    value: pty.UserProfileEthnicBackground.OTHER + 1,
                  },
                ],
              },
            },
            ...(typeof ethnicBackgroundAnswer !== 'undefined' &&
            ethnicBackgroundAnswer === pty.UserProfileEthnicBackground.OTHER
              ? [
                  {
                    name: 'short-text',
                    id: 'ethnic-background-other',
                    attributes: {
                      label: 'Please specify your ethnic background',
                    },
                  },
                ]
              : []),
            {
              name: 'dropdown',
              id: 'country-reside-in-in',
              attributes: {
                required: true,
                multiple: false,
                label: 'What country are you currently residing in?',
                choices: allCountriesQuilFormatted,
              },
            },
            {
              name: 'multiple-choice',
              id: 'in-education',
              attributes: {
                required: true,
                multiple: false,
                verticalAlign: false,
                label:
                  'Are you currently enrolled in any educational institution?',
                choices: [
                  { label: 'Yes', value: true },
                  { label: 'No', value: false },
                ],
              },
            },
            {
              name: 'multiple-choice',
              id: 'education-level',
              attributes: {
                required: true,
                multiple: false,
                verticalAlign: true,
                label: 'What is your education level?',
                choices: [
                  {
                    label: 'Less than High School',
                    value: pty.UserProfileEducationLevel.LESS_THAN_HIGH_SCHOOL,
                  },
                  {
                    label: 'High School or Equivalent',
                    value:
                      pty.UserProfileEducationLevel.HIGH_SCHOOL_OR_EQUIVALENT,
                  },
                  {
                    label: 'Some College or Vocational',
                    value:
                      pty.UserProfileEducationLevel.SOME_COLLEGE_OR_VOCATIONAL,
                  },
                  {
                    label: 'Bachelor',
                    value: pty.UserProfileEducationLevel.BACHELOR,
                  },
                  {
                    label: 'Master',
                    value: pty.UserProfileEducationLevel.MASTER,
                  },
                  {
                    label: 'Doctorate/Professional',
                    value:
                      pty.UserProfileEducationLevel.DOCTORATE_OR_PROFESSIONAL,
                  },
                ],
              },
            },
            {
              name: 'multiple-choice',
              id: 'employment-status',
              attributes: {
                required: true,
                multiple: false,
                verticalAlign: true,
                label: 'What is your employment status?',
                choices: [
                  {
                    label: 'Full-time',
                    value: pty.UserProfileEmploymentStatus.FULLTIME,
                  },
                  {
                    label: 'Part-time',
                    value: pty.UserProfileEmploymentStatus.PARTTIME,
                  },
                  {
                    label: 'Unemployed',
                    value: pty.UserProfileEmploymentStatus.UNEMPLOYED,
                  },
                  {
                    label: 'Student',
                    value: pty.UserProfileEmploymentStatus.STUDENT,
                  },
                  {
                    label: 'Retired',
                    value: pty.UserProfileEmploymentStatus.RETIRED,
                  },
                  {
                    label: 'Other',
                    value: pty.UserProfileEmploymentStatus.OTHER,
                  },
                ],
              },
            },
            ...(typeof employmentStatusAnswer !== 'undefined' &&
            (employmentStatusAnswer as number[])[0] ===
              pty.UserProfileEmploymentStatus.OTHER
              ? [
                  {
                    name: 'short-text',
                    id: 'employment-status-other',
                    attributes: {
                      label: 'Please specify your employment status',
                    },
                  },
                ]
              : []),
            {
              name: 'multiple-choice',
              id: 'device-usage-frequency',
              attributes: {
                required: true,
                multiple: false,
                verticalAlign: true,
                label: 'How frequently do you use electronic devices?',
                choices: [
                  {
                    label: 'Frequently',
                    value: pty.UserProfileDeviceUsageFrequency.FREQUENTLY,
                  },
                  {
                    label: 'Occasionally',
                    value: pty.UserProfileDeviceUsageFrequency.OCCASIONALLY,
                  },
                  {
                    label: 'Rarely',
                    value: pty.UserProfileDeviceUsageFrequency.RARELY,
                  },
                  {
                    label: 'Never',
                    value: pty.UserProfileDeviceUsageFrequency.NEVER,
                  },
                ],
              },
            },
            {
              name: 'multiple-choice',
              id: 'household-income',
              attributes: {
                required: true,
                multiple: false,
                verticalAlign: true,
                label: 'What is your household income level?',
                choices: [
                  {
                    label: 'Under $20,000',
                    value: pty.UserProfileHouseholdIncome.UNDER_20K,
                  },
                  {
                    label: '$20,000 to $40,000',
                    value: pty.UserProfileHouseholdIncome.BTW_20_40K,
                  },
                  {
                    label: '$40,000 to $60,000',
                    value: pty.UserProfileHouseholdIncome.BTW_40_60K,
                  },
                  {
                    label: '$60,000 to $80,000',
                    value: pty.UserProfileHouseholdIncome.BTW_60_80K,
                  },
                  {
                    label: 'Over $100,000',
                    value: pty.UserProfileHouseholdIncome.OVER_100K,
                  },
                ],
              },
            },
            {
              name: 'multiple-choice',
              id: 'primary-language',
              attributes: {
                required: true,
                multiple: false,
                verticalAlign: true,
                label: 'What is your primary language?',
                choices: [
                  { label: 'English', value: 'English' },
                  { label: 'Other', value: 'Other' },
                ],
              },
            },
            ...(typeof primaryLanguageAnswer !== 'undefined' &&
            (primaryLanguageAnswer as string[])[0] === 'Other'
              ? [
                  {
                    name: 'short-text',
                    id: 'primary-language-other',
                    attributes: {
                      label: 'Please specify your primary language',
                    },
                  },
                ]
              : []),
            {
              name: 'short-text',
              id: 'study-hear',
              attributes: {
                required: false,
                label: 'How did you hear about this study?',
              },
            },
          ],
          settings: {
            animationDirection: 'vertical',
            disableWheelSwiping: false,
            disableNavigationArrows: false,
            disableProgressBar: false,
          },
          messages: {
            'label.hintText.key': '',
            'block.defaultThankYouScreen.label':
              'Welcome to <strong>Inclusive AI</strong> 👋!\n\nRedirecting you...',
          },
          theme: {
            font: 'Roboto',
            buttonsBgColor: '#5082eb',
            logo: {
              src: '',
            },
            questionsColor: '#000',
            answersColor: '#0aa7c2',
            buttonsFontColor: '#fff',
            buttonsBorderRadius: 25,
            errorsFontColor: '#fff',
            errorsBgColor: '#f00',
            progressBarFillColor: '#000',
            progressBarBgColor: '#ccc',
          },
        }}
        onSubmit={handleSubmitProfile}
        applyLogic={false}
      />
    </Box>
  )
}

//   <Button
//     variant="outlined"
//     onClick={handleSubmitProfile}
//     disabled={isSubmitting}
//   >
//     Submit Profile
//   </Button>
// </Stack>
