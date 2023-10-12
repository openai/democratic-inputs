import { Button, Stack, Typography } from '@mui/material'
import { useTracking } from 'react-tracking'

import { useWeb3Auth } from '@/hooks'
import { LoadingScreen } from '@/components'

export default function AuthPage() {
  const web3Auth = useWeb3Auth()
  useTracking({ page: 'Auth' })

  // if ready and authenticated, show loading while waiting to redirect to home
  if (!web3Auth.isReady || (web3Auth.isReady && web3Auth.isAuthenticated)) {
    return <LoadingScreen />
  }

  return (
    <Stack
      height="100%"
      width="100%"
      alignItems="center"
      justifyContent="center"
      pb={10}
    >
      <Typography
        variant="h4"
        fontWeight="bold"
        pb={4}
        color="rgb(80, 130, 235)"
      >
        Inclusive AI
      </Typography>
      <Button
        variant="outlined"
        size="large"
        onClick={web3Auth.login}
        sx={{ width: 250, fontSize: '1.1rem' }}
      >
        Sign Up / Sign In
      </Button>
    </Stack>
  )
}
