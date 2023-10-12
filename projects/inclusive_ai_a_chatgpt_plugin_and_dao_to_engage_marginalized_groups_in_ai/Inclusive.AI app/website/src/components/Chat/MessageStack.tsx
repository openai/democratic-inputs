import { Stack } from '@mui/material'
import { styled } from '@mui/material/styles'

// no scrollbar
export const MessageStack = styled(Stack)(({ theme }) => ({
  height: '100%',
  overflowY: 'scroll',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  '-msOverflowStyle': 'none',
}))
