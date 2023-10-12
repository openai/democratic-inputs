import { Stack } from '@mui/material'
import { useRouter } from 'next/router'

import { Navbar } from '@/components'

export function BodyLayout({
  children,
  hideNavbar,
}: React.PropsWithChildren & { hideNavbar?: boolean }) {
  const router = useRouter()

  const showNavbar =
    !router.pathname.startsWith('/auth') &&
    !router.pathname.startsWith('/intro') &&
    !hideNavbar

  return (
    <Stack
      position="relative"
      height="100%"
      bgcolor="#fff"
      borderRadius={4}
      p={2.5}
      direction="column"
      alignItems="stretch"
      justifyContent="flex-start"
      spacing={3}
      overflow="auto"
    >
      <Navbar isHidden={!showNavbar} />
      {children}
    </Stack>
  )
}
