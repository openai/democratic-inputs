import { Button, Stack, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import TagManager from 'react-gtm-module'
import { useTracking } from 'react-tracking'

import { LoadingScreen, Topbar } from '@/components'
import { useAppSelector, useWeb3Auth } from '@/hooks'
import { BodyLayout, MainLayout } from '@/layouts'
import { selectWatchedIntro } from '@/slices/app'

// function isWeb3UserFetched(ctx: Web3AuthProviderData) {
//   return !!ctx.user && !!ctx.provider
// }

export function Web3AuthGatedLayout({ children }: React.PropsWithChildren) {
  const web3Auth = useWeb3Auth()
  const router = useRouter()

  const hasWatchedIntro = useAppSelector(selectWatchedIntro)

  // const userData = useAppSelector(selectUserData)

  // https://github.com/nytimes/react-tracking#top-level-optionsprocess
  const { Track, trackEvent } = useTracking(
    {},
    {
      process: (ownTrackingData: any) =>
        // if child component has `useTracking({ page: 'name' })`, then `ownTrackingData.page` will be set,
        // and the tracker will push `{ event: 'pageview', page: 'name' }` to the dataLayer
        process.env.NEXT_PUBLIC_NODE_ENV === 'production' &&
        ownTrackingData.page
          ? {
              event: 'pageview',
              userId: web3Auth.user?.email,
              // ...ownTrackingData, // already passed
            }
          : null,
    },
  )

  // const {
  //   data: fetchedUserData,
  //   error: fetchErrorUserData,
  //   isLoading: isUserDataLoading,
  //   isFetching: isUserDataFetching,
  //   isError: isUserDataError,
  //   error: userDataError,
  //   refetch: refetchUserData,
  // } = useGetUserQuery(web3Auth.user?.appPubkey || '', {
  //   skip: !web3Auth.user?.appPubkey,
  // })

  useEffect(() => {
    if (
      process.env.NEXT_PUBLIC_NODE_ENV === 'production' &&
      web3Auth.user &&
      web3Auth.user?.email
    ) {
      TagManager.dataLayer({
        dataLayerName: 'Web3AuthGatedLayer',
        dataLayer: {
          userId: web3Auth.user?.email,
        },
      })
    }
  }, [web3Auth])

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_NODE_ENV === 'production') {
      if (web3Auth && web3Auth.user && web3Auth.user.email) {
        trackEvent({
          event: 'userId',
          userId: web3Auth.user.email,
        })
      }
    }
  }, [trackEvent, web3Auth])

  useEffect(() => {
    // if (isConnected && isWeb3UserFetched(web3Auth)) {
    //   if (!web3Auth.isLoading && !web3Auth.isFetching && web3Auth.isError) {
    //     if (router.pathname !== '/intro') {
    //       router.push({ pathname: '/intro', query: router.query })
    //       return
    //     }
    //   }

    //   if (!web3Auth.isLoading && !web3Auth.isFetching && !web3Auth.isError) {
    //     if (!hasWatchedIntro) {
    //       if (router.pathname !== '/intro') {
    //         router.replace({ pathname: '/intro', query: router.query })
    //         return
    //       }
    //     }
    //   }
    // }

    // console.log(web3Auth)

    if (web3Auth.isReady) {
      if (
        !web3Auth.isAuthenticated &&
        router.pathname !== '/' &&
        router.pathname !== '/intro'
      ) {
        router.replace({ pathname: '/' })
        return
      }

      if (
        web3Auth.isAuthenticated &&
        web3Auth.isError &&
        router.pathname !== '/intro'
      ) {
        router.push({ pathname: '/intro' })
      }

      if (
        web3Auth.isAuthenticated &&
        !web3Auth.isError &&
        !hasWatchedIntro &&
        router.pathname !== '/intro'
      ) {
        router.push({ pathname: '/intro' })
      }

      // else if (router.pathname == '/auth') {
      //   router.replace({ pathname: '/', query: router.query })
      //   return
      // }
    } else {
      // console.log('not ready', web3Auth)
      // if (router.pathname !== '/') {
      // }
    }
  }, [hasWatchedIntro, router, web3Auth])

  // if (router.pathname === '/auth') {
  //   return (
  //     <MainLayout>
  //       <BodyLayout>{children}</BodyLayout>
  //     </MainLayout>
  //   )
  // }

  if (
    !web3Auth.isReady &&
    web3Auth.status == 'NOT_READY' &&
    router.pathname === '/'
  ) {
    return (
      <MainLayout>
        <BodyLayout hideNavbar={true}>
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
        </BodyLayout>
      </MainLayout>
    )
  }

  // console.log(web3Auth)
  if (!web3Auth.isReady || (web3Auth.isReady && !web3Auth.isAuthenticated)) {
    return <LoadingScreen />
  }

  return (
    <Track>
      <MainLayout>
        <Topbar />
        <BodyLayout>{children}</BodyLayout>
      </MainLayout>
    </Track>
  )
}
