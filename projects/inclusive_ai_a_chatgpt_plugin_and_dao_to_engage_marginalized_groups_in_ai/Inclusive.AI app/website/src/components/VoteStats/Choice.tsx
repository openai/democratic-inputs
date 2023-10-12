import { Box, Stack, Typography } from '@mui/material'

import { BorderLinearProgress } from '@/components/VoteStats/BorderedLinearProgress'
import { numToCompactString } from '@/utils/misc'

export type ChoiceProps = {
  title: string
  vp: number
  progress: number // out of 100
}

export function Choice(props: ChoiceProps) {
  return (
    <Box width="100%">
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: '1', // max 1-line of text (truncated with ellipsis)
            WebkitBoxOrient: 'vertical',
          }}
        >
          {props.title}
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="flex-start"
        >
          <Typography variant="body2" color="#1a90ff">
            {numToCompactString(props.vp)}
          </Typography>
          <Typography variant="body2" fontWeight={500} color="#aaa">
            {`${props.progress.toFixed(2)}%`}
          </Typography>
        </Stack>
      </Stack>
      <Box width="100%" mt={0.5}>
        <BorderLinearProgress variant="determinate" value={props.progress} />
      </Box>
    </Box>
  )
}
