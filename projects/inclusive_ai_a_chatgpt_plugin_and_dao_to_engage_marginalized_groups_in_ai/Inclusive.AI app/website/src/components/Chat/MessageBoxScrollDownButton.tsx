import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'

export const MessageBoxScrollDownButton = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '50px',
  padding: theme.spacing(1),
  left: '50%',
  right: 0,
  bottom: '80px',
  opacity: 0.8,
  borderRadius: 6,
  backgroundColor: '#fff',
  boxShadow: '0 0 10px rgba(0,0,0,0.10)',
  textAlign: 'center',
  zIndex: 10,
  cursor: 'pointer',
  transform: 'translate(-50%, 0)',
  transition: 'background-color 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: '#eee',
  },
}))
