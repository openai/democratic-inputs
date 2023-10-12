import { Box, SxProps } from '@mui/material'
import { styled } from '@mui/material/styles'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useTracking } from 'react-tracking'

import { useWeb3Auth } from '@/hooks'

const GotoLinkButtonButton = styled(NextLink)(({ theme }) => ({
  display: 'block',
  width: 'full',
  padding: '12px 24px',
  border: '1px solid #e3e4e5',
  borderRadius: 6,
  boxShadow: '0 0 20px 1px rgba(130,130,130,0.05)',
  textAlign: 'center',
  textDecoration: 'none',
  color: 'inherit',
  transition: 'border-color 0.2s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
}))

export const GotoLinkButton = ({ href, children, ...props }: any) => {
  const { trackEvent } = useTracking()
  const { pathname } = useRouter()
  const web3Auth = useWeb3Auth()

  return (
    <GotoLinkButtonButton
      href={href}
      {...props}
      onClick={() => {
        trackEvent({
          action: 'click',
          label: 'goto-link',
          source: pathname,
          userId: web3Auth.user?.email,
        })
      }}
    >
      {children}
    </GotoLinkButtonButton>
  )
}

const GotoLinkButtonButtonForModal = styled(Box)(({ theme }) => ({
  display: 'block',
  width: 'full',
  padding: '12px 24px',
  border: '1px solid #e3e4e5',
  borderRadius: 6,
  boxShadow: '0 0 20px 1px rgba(130,130,130,0.05)',
  textAlign: 'center',
  textDecoration: 'none',
  color: 'inherit',
  transition: 'border-color 0.2s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
}))

export const GotoLinkButtonForModal = ({ href, children, ...props }: any) => {
  const { trackEvent } = useTracking()
  const { pathname } = useRouter()
  const web3Auth = useWeb3Auth()

  return (
    <GotoLinkButtonButtonForModal
      href={href}
      {...props}
      onClick={() => {
        trackEvent({
          action: 'click',
          label: 'goto-link-modal',
          source: pathname,
          userId: web3Auth.user?.email,
        })
        // since there's no `href` prop, we call `onClick` to trigger the modal to open
        props.onClick()
      }}
    >
      {children}
    </GotoLinkButtonButtonForModal>
  )
}

export const GotoLinkButtonForNavigation = ({
  children,
  sx,
  ...props
}: any & { sx?: SxProps }) => {
  return (
    <GotoLinkButtonButtonForModal
      {...props}
      onClick={() => {
        // since there's no `href` prop, we call `onClick` to trigger the modal to open
        props.onClick()
      }}
      sx={sx}
    >
      {children}
    </GotoLinkButtonButtonForModal>
  )
}
