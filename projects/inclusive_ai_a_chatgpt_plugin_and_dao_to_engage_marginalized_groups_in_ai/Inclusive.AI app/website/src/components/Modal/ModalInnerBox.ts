import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'

export const ModalInnerBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  maxWidth: 600,
  width: '100%',
  padding: theme.spacing(3),
  backgroundColor: '#fff',
  borderRadius: '10px',
  boxShadow: '0 0 20px 1px rgba(130,130,130,0.13)',
  transform: 'translate(-50%, -50%)',
  zIndex: 100,
})) as typeof Box
