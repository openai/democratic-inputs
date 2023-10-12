import { Box, Breadcrumbs, Link, Stack, Typography } from '@mui/material'
import NextLink from 'next/link'
import { useRouter } from 'next/router'

import { useWeb3Auth } from '@/hooks'

const breadcrumbNameMap: Record<string, string> = {
  '/': 'Converse with AI',
  '/intro': 'Intro',
  '/discuss': 'Discuss with Others',
  '/vote': 'Vote on Topic',
  '/profile': 'Your Profile',
}

export function Topbar() {
  const router = useRouter()
  const web3Auth = useWeb3Auth()
  const web3AuthUser = web3Auth.user

  const pathnames = router.pathname.split('/').filter((x) => x)
  // const showHome = pathnames[0] !== 'intro' && pathnames[0] !== 'auth'

  if (!web3Auth || !web3AuthUser) return <Box />

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      py={1.7}
      px={{ xs: 10, md: 11 }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={4}
        aria-hidden={true}
      >
        <NextLink href="/">
          <Typography variant="h5" fontWeight="bold" color="rgb(80, 130, 235)">
            Inclusive AI
          </Typography>
        </NextLink>
        {/* <Navbar isHidden={!showHome} /> */}
        <Breadcrumbs>
          {!pathnames.length ? (
            <Link
              component={NextLink}
              underline="hover"
              color="inherit"
              href="/"
            >
              {breadcrumbNameMap['/']}
            </Link>
          ) : (
            pathnames.map((value, index) => {
              const last = index === pathnames.length - 1
              const to = `/${pathnames.slice(0, index + 1).join('/')}`

              return last ? (
                <Typography color="text.primary" key={to}>
                  {breadcrumbNameMap[to]}
                </Typography>
              ) : (
                <Link
                  component={NextLink}
                  underline="hover"
                  color="inherit"
                  href={to}
                  key={to}
                >
                  {breadcrumbNameMap[to]}
                </Link>
              )
            })
          )}
        </Breadcrumbs>
        <Stack direction="row" alignItems="center" spacing={2}>
          {/* <Typography variant="body1" fontWeight="bold">
            {web3AuthUser.name?.split(' ')[0] || ''}
          </Typography> */}
          <Typography variant="body2" color="#777">
            {web3AuthUser.email || ''}
          </Typography>
          {/* <Avatar alt={web3AuthUser.name} src={web3AuthUser.profileImage} /> */}
        </Stack>
      </Stack>
    </Box>
  )
}
