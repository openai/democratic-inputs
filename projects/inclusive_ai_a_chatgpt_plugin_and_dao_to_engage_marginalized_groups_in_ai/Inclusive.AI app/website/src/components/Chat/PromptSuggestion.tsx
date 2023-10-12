import { Stack } from '@mui/material'
import { styled } from '@mui/material/styles'

export const PromptSuggestion = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '6px',
  height: '100%',
  width: '100%',
  padding: theme.spacing(2),
  borderRadius: 4,
  backgroundColor: '#f7f9fc',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: '#c9e6fc',
  },
}))
