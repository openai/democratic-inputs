import { Box, Stack, Typography } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'

import type { ProposalGenericProps, ProposalUserVotes } from '@/components'
import {
  ProposalOptionStack,
  ProposalOptionInnerStack,
  ProposalOptionInput,
  ProposalOptionInputButton,
  ProposalOptionVoteButton,
} from '@/components'
import {
  calculateTotalVotesByUser,
  clampNum,
  getUserVoteChoice,
  numToPercString,
} from '@/utils'

export function ProposalQuadraticVote(props: ProposalGenericProps) {
  const {
    choices,
    userVp,
    userProposalVotes: prevUserProposalVotes,
    voteOnProposal,
    isSubmittingVote,
    isSubmittingError,
    isSubmittingSuccess,
  } = props

  // console.log('prevUserProposalVotes', prevUserProposalVotes)
  const [userProposalVotes, setUserProposalVotes] = useState<ProposalUserVotes>(
    prevUserProposalVotes,
  )

  const [castState, setCastState] = useState<{ type: string; text: string }>({
    type: 'info',
    text: '',
  })

  const userTotalVotes = useMemo(
    () => calculateTotalVotesByUser(userProposalVotes),
    [userProposalVotes],
  )

  const increaseChoiceVote = useCallback((choiceIdx: number) => {
    setUserProposalVotes((prevState) => ({
      ...prevState,
      // choice is 1-indexed
      [choiceIdx]: Math.max(0, getUserVoteChoice(prevState, choiceIdx) + 1),
    }))
  }, [])

  const decreaseChoiceVote = useCallback((choiceIdx: number) => {
    setUserProposalVotes((prevState) => ({
      ...prevState,
      // choice is 1-indexed
      [choiceIdx]: Math.max(0, getUserVoteChoice(prevState, choiceIdx) - 1),
    }))
  }, [])

  const castVoteHandler = useCallback(() => {
    if (userTotalVotes !== userVp) {
      setCastState({ type: 'error', text: 'You must cast all votes!' })
      return
    }

    voteOnProposal(userProposalVotes)
  }, [userProposalVotes, userTotalVotes, userVp, voteOnProposal, setCastState])

  useEffect(() => {
    if (isSubmittingError) {
      setCastState({
        type: 'error',
        text: 'Error occured while voting, please refresh the page.',
      })
    }
  }, [isSubmittingError])

  return (
    <Box border="1px solid #e7e9ec" borderRadius={4} mt={5}>
      <Typography
        variant="body1"
        fontWeight="bold"
        py={2}
        px={3}
        borderBottom="1px solid #e7e9ec"
      >
        Cast your votes! You must use all {userVp} votes.
      </Typography>
      <Stack p={3} spacing={1}>
        {choices.map((choice) => {
          // console.log(
          //   choice.index,
          //   getUserVoteChoice(userProposalVotes, choice.index),
          // )
          const choiceVotePerc = numToPercString(
            getUserVoteChoice(userProposalVotes, choice.index) /
              (userTotalVotes || 1),
          )

          // Total Avalable Votes - Total Votes Casted + Current Choice's Votes
          const maxChoiceVotes =
            userVp -
            userTotalVotes +
            getUserVoteChoice(userProposalVotes, choice.index)

          return (
            <ProposalOptionStack key={choice.index}>
              <Typography variant="body1">{choice.choice}</Typography>
              <ProposalOptionInnerStack>
                <ProposalOptionInputButton
                  onClick={() => decreaseChoiceVote(choice.index)}
                >
                  -
                </ProposalOptionInputButton>
                <ProposalOptionInput
                  type="number"
                  value={+getUserVoteChoice(userProposalVotes, choice.index)}
                  inputProps={{
                    min: 0,
                    max: maxChoiceVotes,
                  }}
                  onChange={(e) => {
                    setUserProposalVotes((prevState) => ({
                      ...prevState,
                      [choice.index]: clampNum(
                        parseInt(e.target.value) || 0,
                        0,
                        maxChoiceVotes,
                      ),
                    }))
                  }}
                />
                <ProposalOptionInputButton
                  onClick={() => {
                    if (userTotalVotes >= userVp) return
                    increaseChoiceVote(choice.index)
                  }}
                >
                  +
                </ProposalOptionInputButton>
                <Typography
                  variant="body1"
                  color="#777"
                  pl={2}
                  width={60}
                  textAlign="right"
                >
                  {choiceVotePerc}
                </Typography>
              </ProposalOptionInnerStack>
            </ProposalOptionStack>
          )
        })}
        <Typography
          variant="body1"
          fontWeight="bold"
          py={1}
          pr={17.5}
          textAlign="right"
        >
          Available: {userVp - userTotalVotes}
        </Typography>
      </Stack>
      <Stack py={1} px={3} spacing={1} borderTop="1px solid #e7e9ec">
        <Typography variant="body1" color={castState.type} fontWeight="bold">
          {castState.text}
        </Typography>
        <ProposalOptionVoteButton
          onClick={castVoteHandler}
          disabled={isSubmittingVote}
        >
          <Typography variant="body1" fontWeight="bold">
            {isSubmittingError
              ? 'Error!'
              : isSubmittingSuccess
              ? 'Voted!'
              : isSubmittingVote
              ? 'Submitting...'
              : 'Vote'}
          </Typography>
        </ProposalOptionVoteButton>
      </Stack>
    </Box>
  )
}
