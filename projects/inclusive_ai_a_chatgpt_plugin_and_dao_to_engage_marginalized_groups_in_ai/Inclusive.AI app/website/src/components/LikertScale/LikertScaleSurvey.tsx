import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import { useCallback, useState } from 'react'

import { LikertScaleQuestion } from '@/components/LikertScale'
import { usePostSurveyAiMutation } from '@/services/survey'

// import { Form as QuillForm, useFieldAnswer } from '@quillforms/renderer-core'
// import '@quillforms/renderer-core/build-style/style.css'
// import { SubmissionDispatchers } from '@quillforms/renderer-core/build-types/types'
// // @ts-ignore
// import { registerCoreBlocks } from '@quillforms/react-renderer-utils'
// registerCoreBlocks()

export interface LikertScaleSurveyQuestion {
  id: string
  label: string
  type?: 'likert' | 'text'
  // choices: { label: string; value: string }[]
}

interface LikertScaleSurveyProps {
  surveyTitle: string
  surveyDescription: string
  questions: LikertScaleSurveyQuestion[]
  // for submission
  appPubkey: string
}

export function LikertScaleSurvey(props: LikertScaleSurveyProps) {
  const router = useRouter()
  const [postSurveyAi, postSurveyAiResult] = usePostSurveyAiMutation()

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [surveyValues, setSurveyValues] = useState<
    Record<string, number | string>
  >(props.questions.reduce((arr, q) => ({ ...arr, [q.id]: 0 }), {}))

  const handleSubmitSurvey = useCallback(async () => {
    console.log('submitting survey')
    // console.log(surveyValues)
    setIsSubmitting(true)

    // const testSurveyValues = Object.keys(surveyValues).reduce(
    //   (arr, id) => ({ ...arr, [id]: 1 }),
    //   {},
    // )

    try {
      const res = await postSurveyAi({
        survey: surveyValues,
        // process.env.NEXT_PUBLIC_NODE_ENV === 'production'
        //   ? surveyValues
        //   : testSurveyValues,
        appPubkey: props.appPubkey,
      })

      if (!('error' in res) && !!res.data.payload) {
        console.log('success')
        setTimeout(() => router.push('/discuss'), 2000)
      } else {
        throw new Error('Failed to submit survey')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setTimeout(() => {
        // router.reload()
        setIsSubmitting(false)
      }, 2000)
    }
  }, [surveyValues, props.appPubkey, postSurveyAi, router])

  // const blockQuestions = props.questions.map((question) => ({
  //   name: 'multiple-choice',
  //   id: question.id,
  //   attributes: {
  //     required: true,
  //     multiple: false,
  //     verticalAlign: true,
  //     label: question.label,
  //     choices: [
  //       { label: 'Strongly Disagree', value: 1 },
  //       { label: 'Disagree', value: 2 },
  //       { label: 'Neutral', value: 3 },
  //       { label: 'Agree', value: 4 },
  //       { label: 'Strongly Agree', value: 5 },
  //     ],
  //   },
  // }))

  return (
    <Box
      width="100%"
      height={{ xs: 400, md: 600 }}
      py={3}
      px={4}
      sx={{ overflowY: 'scroll' }}
    >
      <Typography variant="h4" fontWeight="bold">
        {props.surveyTitle}
      </Typography>
      <Typography variant="body1" color="#999" mt={1}>
        {props.surveyDescription}
      </Typography>
      <Stack justifyContent="flex-start" alignItems="stretch" mt={2}>
        {props.questions.map((q, idx) =>
          !q.type || q.type === 'likert' ? (
            <Box py={3} borderTop="1px solid #999" key={idx}>
              <LikertScaleQuestion
                key={q.id}
                label={q.label}
                currentChoice={surveyValues[q.id] as number}
                setCurrentChoice={(choice) =>
                  setSurveyValues((prev) => ({ ...prev, [q.id]: choice }))
                }
              />
            </Box>
          ) : (
            <Box py={3} borderTop="1px solid #999" key={idx}>
              <Typography variant="h6" fontWeight="bold">
                {q.label}
              </Typography>
              <TextField
                variant="outlined"
                fullWidth
                value={surveyValues[q.id] || ''}
                onChange={(e) =>
                  setSurveyValues((prev) => ({
                    ...prev,
                    [q.id]: String(e.target.value),
                  }))
                }
              />
            </Box>
          ),
        )}
        <Button
          variant="contained"
          color={
            postSurveyAiResult.isSuccess
              ? postSurveyAiResult.data?.payload
                ? 'success'
                : 'error'
              : 'primary'
          }
          sx={{ mt: 2 }}
          disabled={
            isSubmitting || postSurveyAiResult.isLoading
            // postSurveyAiResult.isSuccess
          }
          onClick={handleSubmitSurvey}
        >
          {postSurveyAiResult.isSuccess
            ? postSurveyAiResult.data?.payload
              ? 'Thanks for submitting!'
              : 'Complete Survey'
            : 'Complete Survey'}
        </Button>
        {postSurveyAiResult.isSuccess && !postSurveyAiResult.data?.payload && (
          <Typography>Invalid survey data</Typography>
        )}
      </Stack>
      {/* <QuillForm
        formId={2}
        formObj={{
          blocks: [
            {
              name: 'welcome-screen',
              id: 'survey-welcome-screen',
              attributes: {
                label: props.surveyTitle,
                description: props.surveyDescription,
              },
            },
            ...blockQuestions,
          ],
          settings: {
            animationDirection: 'vertical',
            disableWheelSwiping: false,
            disableNavigationArrows: false,
            disableProgressBar: false,
          },
          messages: {
            'label.hintText.key': '',
          },
          theme: {
            font: 'Roboto',
            fontSize: { sm: '14px', lg: '16px' },
            questionsLabelFontSize: { sm: '16px', lg: '18px' },
            questionsLabelLineHeight: { sm: '20px', lg: '24px' },
            questionsDescriptionFontSize: { sm: '14px', lg: '16px' },
            buttonsFontSize: { sm: '14px', lg: '16px' },
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
        onSubmit={handleSubmitSurvey}
        applyLogic={false}
      /> */}
    </Box>
  )
}
