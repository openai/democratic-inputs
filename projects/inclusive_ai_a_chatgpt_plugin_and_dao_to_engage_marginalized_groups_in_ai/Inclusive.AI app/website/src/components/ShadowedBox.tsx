import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'

export const ShadowedBox = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(1.5),
  paddingBottom: theme.spacing(1.5),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  borderRadius: 2,
  border: '1px solid #fafafa',
  boxShadow: '0 0 20px 1px rgba(130, 130, 130, 0.05)',
}))
