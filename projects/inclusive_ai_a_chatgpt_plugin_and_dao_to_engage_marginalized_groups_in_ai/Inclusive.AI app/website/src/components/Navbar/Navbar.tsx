import { Box, Link, Stack, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useTracking } from 'react-tracking'

import { useWeb3Auth } from '@/hooks'

type NavbarLinkTabProps = {
  href: string
  label: string
  isActive: boolean
}

const StyledLink = styled(Link)({
  color: '#333',
  width: '100%',
  backgroundColor: 'inherit',
  padding: '8px 20px',
  // padding: '6px 10px',
  // borderRadius: 6,
  textDecoration: 'none',
  fontSize: '1.2rem',
  // transition: 'box-shadow 0.2s ease-in-out',
  transition: 'background-color 0.2s ease-in-out',
  '&.active': {
    backgroundColor: 'rgba(201, 230, 252, 0.7)',
  },
  '&:hover': {
    // boxShadow: '0 0 20px 2px rgba(130, 130, 130, 0.13)',
    backgroundColor: 'rgb(201, 230, 252)',
  },
}) as typeof Link

function NavbarLinkTab(props: NavbarLinkTabProps) {
  const { pathname } = useRouter()
  const { trackEvent } = useTracking()
  const web3Auth = useWeb3Auth()

  return (
    <StyledLink
      component={NextLink}
      href={props.href}
      // maxWidth={300}
      borderRadius={2}
      className={props.isActive ? 'active' : ''}
      onClick={() =>
        trackEvent({
          action: 'click',
          label: 'navbar-link',
          source: pathname,
          userId: web3Auth.user?.email,
        })
      }
    >
      <Typography variant="body1" fontWeight="bold" align="center">
        {props.label}
      </Typography>
    </StyledLink>
  )
}

export function Navbar(props: { isHidden: boolean }) {
  const { pathname } = useRouter()
  const web3Auth = useWeb3Auth()

  return (
    <Box width="100%" display={props.isHidden ? 'none' : 'flex'}>
      <Stack
        direction="row"
        justifyContent="center"
        width="100%"
        spacing={1}
        p={0.8}
        bgcolor="rgb(247, 249, 252)"
        borderRadius={3}
      >
        <NavbarLinkTab
          href="/"
          label="💬&nbsp;&nbsp;Chat with AI"
          isActive={pathname === '/'}
          aria-label="Chat with AI"
        />
        <NavbarLinkTab
          href="/discuss"
          label="👥&nbsp;&nbsp;Discuss"
          isActive={pathname === '/discuss'}
          aria-label="Discuss with other users"
        />
        <NavbarLinkTab
          href="/vote"
          label="⚡&nbsp;&nbsp;Vote"
          isActive={pathname === '/vote'}
          aria-label="Vote on proposal"
        />
        {web3Auth &&
          web3Auth.isReady &&
          web3Auth.isAuthenticated &&
          web3Auth.user &&
          (web3Auth.user.email === 'jwp6@illinois.edu' ||
            web3Auth.user.email === 'tsharma6@illinois.edu') && (
            <NavbarLinkTab
              href="/controlpanel"
              label="🔧&nbsp;&nbsp;Control Panel"
              isActive={pathname === '/controlpanel'}
              aria-label="Control Panel"
            />
          )}
        {/* <NavbarLinkTab
          href="/profile"
          label="Profile"
          isActive={pathname === '/profile'}
        /> */}
      </Stack>
    </Box>
  )
}
