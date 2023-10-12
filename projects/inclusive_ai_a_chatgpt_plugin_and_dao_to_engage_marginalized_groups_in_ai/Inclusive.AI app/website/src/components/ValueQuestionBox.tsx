import { styled } from '@mui/material/styles'
import NextLink from 'next/link'

export const ValueQuestionBox = styled(NextLink)(({ theme }) => ({
  display: 'inline-block',
  width: 'full',
  padding: '12px 24px',
  border: '1px solid #e3e4e5',
  borderRadius: 6,
  boxShadow: '0 0 20px 1px rgba(130,130,130,0.05)',
  textDecoration: 'none',
  color: 'inherit',
  transition: 'border-color 0.2s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    cursor: 'pointer',
  },
}))
