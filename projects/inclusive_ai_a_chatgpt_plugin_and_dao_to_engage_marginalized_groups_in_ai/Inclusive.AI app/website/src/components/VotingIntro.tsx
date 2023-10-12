import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import ReactPlayer from 'react-player'

import { useAppDispatch } from '@/hooks'
import { setCompletedVotingIntro } from '@/slices/app'

interface VotingRadioQuestionProps {
  question: string
  choices: { value: string; label: string }[]
  answer: string
  goToNext: () => void
}

function VotingRadioQuestion(props: VotingRadioQuestionProps) {
  const { question, choices, answer, goToNext } = props

  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [complete, setComplete] = useState(false)
  const [helperText, setHelperText] = useState('')

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value)
    setHelperText(' ')
    setError(false)
  }

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      if (value === answer) {
        setHelperText('You selected the correct answer!')
        setError(false)
        setComplete(true)
      } else if (value === '') {
        setHelperText('Please select an option.')
        setError(true)
      } else {
        const answerLabel = choices.find((x) => x.value === answer)
        setHelperText(`Correct answer: ${answerLabel ? answerLabel.label : ''}`)
        setError(true)
        setComplete(true)
      }
    },
    [answer, choices, value],
  )

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 650, margin: '0 auto' }}>
      <FormControl sx={{ p: 3 }} error={error} variant="standard">
        <FormLabel id={question} sx={{ mb: 1 }}>
          {question}
        </FormLabel>
        <RadioGroup
          aria-labelledby={question}
          value={value}
          onChange={handleRadioChange}
        >
          {choices.map((choice) => (
            <FormControlLabel
              key={choice.value}
              value={choice.value}
              control={<Radio />}
              label={choice.label}
            />
          ))}
        </RadioGroup>
        <Button type="submit" variant="outlined" sx={{ mt: 1 }}>
          Check Answer
        </Button>
        <Typography variant="body1" fontWeight="bold" mt={1}>
          {helperText}
        </Typography>
        {complete && (
          <Button
            type="button"
            variant="outlined"
            color="info"
            onClick={goToNext}
            aria-label="Go next"
            sx={{ mt: 2 }}
          >
            Next
          </Button>
        )}
      </FormControl>
    </form>

    // <RadioGroup defaultValue={props.choices[0].value}>
    //   {props.choices.map((choice) => (
    //     <RadioFormControlLabel
    //       key={choice.value}
    //       value={choice.value}
    //       label={choice.label}
    //       control={<Radio />}
    //     />
    //   ))}
    // </RadioGroup>
  )
}

interface VotingIntroProps {
  // votingType: 'quadratic' | 'weighted'
  votingType: string
  userVotingPower: number
}

export function VotingIntro(props: VotingIntroProps) {
  const { userVotingPower, votingType } = props

  const dispatch = useAppDispatch()

  const votingTypeReadable = votingType === 'quadratic' ? 'Quadratic' : 'Ranked'

  // const [step, setStep] = useState<number>(votingType == 'quadratic' ? 2 : 1)
  const [step, setStep] = useState<number>(1)
  const [watchedVideo, setWatchedIntro] = useState(false)

  useEffect(() => {
    if (step === 4) dispatch(setCompletedVotingIntro(true))
  }, [step, dispatch])

  return (
    <>
      <Box bgcolor="#edf7ff" py={2} px={3} borderRadius={3}>
        <Typography variant="body1">
          Your vote plays a crucial role in shaping the future of AI. It helps
          ensure fairness for you and the broader community in AI usage. AI
          companies will take this into consideration. In this proposal, there
          are <b>four potential solutions</b> presented. You have{' '}
          <b>{userVotingPower} votes</b> to allocate among these choices. You
          are assigned to <b>{votingTypeReadable}</b> voting system.
        </Typography>
      </Box>
      <Typography variant="h5" my={3} textAlign="center" fontWeight="bold">
        Understand <b>{votingTypeReadable}</b> voting
      </Typography>
      {step == 1 &&
        (votingType === 'quadratic' ? (
          <>
            <ReactPlayer
              url="https://www.youtube.com/watch?v=uz8Jgkc8fBI"
              controls={true}
              onEnded={() => setWatchedIntro(true)}
              style={{ margin: '0 auto' }}
            />
            <Typography variant="body1" textAlign="center" gutterBottom mt={1}>
              Watch until the end to proceed.
            </Typography>
            {watchedVideo && (
              <Box textAlign="center">
                <Button
                  type="button"
                  variant="contained"
                  color="info"
                  onClick={() => setStep(2)}
                  aria-label="Go next"
                  sx={{ maxWidth: 500 }}
                  fullWidth
                >
                  Next
                </Button>
              </Box>
            )}
          </>
        ) : (
          <>
            <ReactPlayer
              url="https://www.youtube.com/watch?v=HEByNZ0QwJs"
              controls={true}
              onEnded={() => setWatchedIntro(true)}
              style={{ margin: '0 auto' }}
            />
            <Typography variant="body1" textAlign="center" gutterBottom mt={1}>
              Watch until the end to proceed.
            </Typography>
            {watchedVideo && (
              <Box textAlign="center">
                <Button
                  type="button"
                  variant="contained"
                  color="info"
                  onClick={() => setStep(2)}
                  aria-label="Go next"
                  sx={{ maxWidth: 500 }}
                  fullWidth
                >
                  Next
                </Button>
              </Box>
            )}
          </>
        ))}
      {step == 2 &&
        (votingType === 'quadratic' ? (
          <VotingRadioQuestion
            question="What is the primary goal of Quadratic Voting?"
            choices={[
              {
                value: 'A',
                label: 'To allow voters to cast votes for multiple candidates.',
              },
              {
                value: 'B',
                label:
                  'To allow voters to express the intensity of their preferences.',
              },
              {
                value: 'C',
                label: 'To ensure that each voter has only one vote.',
              },
              {
                value: 'D',
                label: 'To rank candidates in order of preference.',
              },
            ]}
            answer="B"
            goToNext={() => setStep(3)}
          />
        ) : (
          <VotingRadioQuestion
            question="What is the primary characteristic of Ranking Voting?"
            choices={[
              {
                value: 'A',
                label: 'Voters assign a score to each candidate.',
              },
              {
                value: 'B',
                label: 'Voters rank candidates in order of preference.',
              },
              {
                value: 'C',
                label: 'Voters can only vote for one candidate.',
              },
              { value: 'D', label: 'Voters pay for each vote they cast.' },
            ]}
            answer="B"
            goToNext={() => setStep(3)}
          />
        ))}

      {step == 3 &&
        (votingType === 'quadratic' ? (
          <VotingRadioQuestion
            question="In Quadratic Voting, how is the cost of multiple votes for a single issue or candidate determined?"
            choices={[
              {
                value: 'A',
                label:
                  'The cost remains constant regardless of the number of votes.',
              },
              {
                value: 'B',
                label: 'The cost increases linearly with the number of votes.',
              },

              {
                value: 'C',
                label:
                  'The cost increases quadratically with the number of votes.',
              },
              {
                value: 'D',
                label: 'The cost decreases as more votes are cast.',
              },
            ]}
            answer="C"
            goToNext={() => setStep(4)}
          />
        ) : (
          <VotingRadioQuestion
            question="What is the primary purpose of Weighted Ranking Voting?"
            choices={[
              {
                value: 'A',
                label:
                  'To allow voters to give each candidate a numerical score.',
              },
              {
                value: 'B',
                label:
                  'To allow voters to rank candidates in order of preference, with different weights assigned to each rank.',
              },
              {
                value: 'C',
                label: 'To ensure that each voter has only one vote.',
              },
              {
                value: 'D',
                label:
                  'To allow voters to vote for multiple candidates without ranking them.',
              },
            ]}
            answer="B"
            goToNext={() => setStep(4)}
          />
        ))}
    </>
  )
}
