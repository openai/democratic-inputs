import { IconButton } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useTracking } from 'react-tracking'

import { useWeb3Auth } from '@/hooks'

const ChatSideIconButtonButton = styled(IconButton)(({ theme }) => ({
  bgcolor: '#f4f5f6',
  borderRadius: 3,
  '&:hover': {
    backgroundColor: '#eee',
  },
}))

export const ChatSideIconButton = ({ children, source, ...props }: any) => {
  const { trackEvent } = useTracking()
  const web3Auth = useWeb3Auth()
  return (
    <ChatSideIconButtonButton
      {...props}
      onClick={() => {
        trackEvent({
          action: 'click',
          label: 'send-chat',
          source,
          userId: web3Auth.user?.email,
        })
        props.onClick()
      }}
    >
      {children}
    </ChatSideIconButtonButton>
  )
}
