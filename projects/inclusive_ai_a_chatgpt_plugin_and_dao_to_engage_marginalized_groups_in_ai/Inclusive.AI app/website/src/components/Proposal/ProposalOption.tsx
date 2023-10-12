import { Box, Button, InputBase, Stack } from '@mui/material'
import { styled } from '@mui/material/styles'

export const ProposalOptionStack = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: 'full',
  padding: '0 24px',
  border: '1px solid #e3e4e5',
  borderRadius: 50,
  textAlign: 'center',
  transition: 'border-color 0.2s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
}))

export const ProposalOptionInnerStack = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
}))

export const ProposalOptionInput = styled(InputBase)(({ theme }) => ({
  width: 60,
  padding: '0 8px',
  textAlign: 'center',
  '& > input': {
    textAlign: 'center',
  },
}))

export const ProposalOptionInputButton = styled(Box)(({ theme }) => ({
  minWidth: 40,
  padding: '10px 4px',
  borderRadius: 0,
  borderLeft: '1px solid #e3e4e5',
  borderRight: '1px solid #e3e4e5',
  transition: 'background-color 0.2s ease-in-out',
  cursor: 'pointer',
  userSelect: 'none',
  '&:hover': {
    backgroundColor: '#e3e4e5',
    opacity: 1,
  },
}))

export const ProposalOptionVoteButton = styled(Button)(({ theme }) => ({
  width: 'full',
  padding: '12px 24px',
  color: '#fff',
  backgroundColor: theme.palette.primary.main,
  opacity: 0.8,
  border: '1px solid #e3e4e5',
  borderRadius: 50,
  textAlign: 'center',
  transition: 'all 0.2s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    opacity: 1,
  },
}))
