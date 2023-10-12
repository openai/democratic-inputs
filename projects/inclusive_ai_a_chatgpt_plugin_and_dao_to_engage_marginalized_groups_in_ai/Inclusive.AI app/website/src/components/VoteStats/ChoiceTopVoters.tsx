import { Box, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'

import { SnapshotProposalVote } from '@/types'
import { numToCompactString, truncateIfAddressOrLong } from '@/utils/misc'

export type ChoiceTopVotersProps = {
  choice: string
  choiceIndex: number // choice index, start from 0 (for indexing votes array)
  n: number // number of top voters to show
  votes: SnapshotProposalVote[]
  totalVotePower: number
}

export function ChoiceTopVoters(props: ChoiceTopVotersProps) {
  const [topVotes, setTopVotes] = useState<SnapshotProposalVote[]>([])

  useEffect(() => {
    const topVotes = props.votes
      .filter((vote) => {
        // vote index starts at 1
        if (Array.isArray(vote.choice))
          return vote.choice.includes(props.choiceIndex + 1)
        return vote.choice === props.choiceIndex + 1
      })
      .sort((a, b) => b.vp - a.vp) // sort by vp desc
      .slice(0, props.n) // get top n voters

    setTopVotes(topVotes)
  }, [props])

  return (
    <Box pt={1}>
      <Typography
        variant="body2"
        fontWeight="bold"
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: '2', // max 2-line of text (truncated with ellipsis)
          WebkitBoxOrient: 'vertical',
        }}
      >
        {props.choice}
      </Typography>
      {topVotes.map((vote, i) => (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography
            variant="body2"
            color="#999"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: '1', // max 1-line of text (truncated with ellipsis)
              WebkitBoxOrient: 'vertical',
            }}
          >
            {truncateIfAddressOrLong(vote.voter, 26)}
          </Typography>
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            justifyContent="flex-end"
          >
            <Typography variant="body2" color="#1a90ff">
              {numToCompactString(vote.vp)}
            </Typography>
            <Typography variant="body2" color="#aaa">
              {`(${((vote.vp / props.totalVotePower) * 100).toFixed(2)}%)`}
            </Typography>
          </Stack>
        </Stack>
      ))}
    </Box>
  )
}
