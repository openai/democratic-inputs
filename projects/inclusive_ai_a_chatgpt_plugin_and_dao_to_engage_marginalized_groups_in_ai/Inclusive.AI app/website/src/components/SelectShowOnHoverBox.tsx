import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'

export const SelectShowOnHoverBox = styled(Box)(({ theme }) => ({
  // display: 'hidden',
  '& .select-show-on-hover-box': {
    opacity: 0,
    transition: 'opacity 0.1s ease-in-out',
  },
  '&:hover .select-show-on-hover-box': {
    // display: 'block',
    opacity: 1,
  },
})) as typeof Box
