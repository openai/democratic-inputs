import { Box } from '@mui/material'

export function MainLayout({ children }: React.PropsWithChildren) {
  return (
    <Box
      height="100vh"
      maxHeight="100vh"
      overflow="hidden"
      pt={7}
      pb={3}
      px={4}
    >
      {children}
    </Box>
  )
}
