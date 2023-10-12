import { Web3Provider } from '@ethersproject/providers'
import { Box, Typography } from '@mui/material'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import ReactPlayer from 'react-player'
import { useTracking } from 'react-tracking'

import { GotoLinkButtonForNavigation, LoadingScreen } from '@/components'
import { useAppDispatch, useAppSelector, useWeb3Auth } from '@/hooks'
// import { usePreInitUserMutation } from '@/services/user'
import { useCreateUserMutation } from '@/services/user'
import { setWatchedIntro } from '@/slices/app'
import { selectUserData } from '@/slices/user'

//const introYoutubeUrl = 'https://www.youtube.com/watch?v=sqQrN0iZBs0' // DALL-E 3
const introYoutubeUrl = 'https://www.youtube.com/watch?v=oBU2p72SsrM' // Inclusive AI — Intro

export default function IntroPage() {
  useTracking({ page: 'Intro' })

  const web3Auth = useWeb3Auth()
  const dispatch = useAppDispatch()
  const router = useRouter()

  const userData = useAppSelector(selectUserData)

  const [isIntroVideoEnded, setIsIntroVideoEnded] = useState(false)

  // const [preInitUser] = usePreInitUserMutation()
  const [createUser, createUserRes] = useCreateUserMutation()

  const introEndHandler = useCallback(() => {
    dispatch(setWatchedIntro(true))
    router.push('/')
  }, [dispatch, router])

  useEffect(() => {
    if (!web3Auth || !web3Auth.user || !web3Auth.provider) return

    const createUserFn = async () => {
      try {
        if (!web3Auth || !web3Auth.user || !web3Auth.provider) return
        if (userData.user.address !== '') return // address is set, ie. getUser successful

        const userAddress = await new Web3Provider(web3Auth.provider)
          .getSigner()
          .getAddress()

        const res = await createUser({
          name: web3Auth.user.name || web3Auth.user.email || 'n/a',
          role: 'participant',
          userId: web3Auth.user.email || '',
          appPubkey: web3Auth.user.appPubkey || '',
          address: userAddress,
        })

        console.log(res)
      } catch (err) {
        console.error(err)
      }
    }

    createUserFn()
  }, [createUser, userData.user.address, web3Auth])

  useEffect(() => {
    if (
      createUserRes.isSuccess &&
      !createUserRes.data.error &&
      createUserRes.data.payload === 'success'
    ) {
      router.refresh()
      // router.replace('/')
    }
  }, [createUserRes, router])

  if (
    !web3Auth ||
    !web3Auth.isReady ||
    (web3Auth.isReady && !web3Auth.isAuthenticated) ||
    !web3Auth.user ||
    !web3Auth.userPod ||
    !web3Auth.userPod.valueQuestion[0]
  ) {
    // console.log('loading')
    return <LoadingScreen />
  }

  return (
    <Box height="100%" width="100%">
      <Typography variant="h4" textAlign="center" gutterBottom>
        Watch the Intro video
      </Typography>
      <Box
        height="100%"
        width="100%"
        // from react-player's default settings
        // ratio: 16 / 9
        maxWidth={800}
        maxHeight={450}
        margin="0 auto"
      >
        <ReactPlayer
          url={introYoutubeUrl}
          controls={true}
          onEnded={() => setIsIntroVideoEnded(true)}
          height="100%"
          width="100%"
        />
      </Box>
      <Typography variant="body1" textAlign="center" gutterBottom mt={1}>
        Watch until the end to proceed.
      </Typography>
      {isIntroVideoEnded && (
        <Box maxWidth={300} width="100%" margin="24px auto 0">
          <GotoLinkButtonForNavigation
            onClick={introEndHandler}
            sx={{ bgcolor: '#f3f4f5' }}
          >
            <Typography variant="body1" fontWeight="bold">
              Continue
            </Typography>
          </GotoLinkButtonForNavigation>
          {/* <Button
            variant="contained"
            color="primary"
            onClick={introEndHandler}
            size="large"
            fullWidth
          >
            Continue
          </Button> */}
        </Box>
      )}
    </Box>
  )
}
