import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SendOutlinedIcon from '@mui/icons-material/SendOutlined'
import { Box, Stack, InputBase, type SxProps } from '@mui/material'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  ChatSideIconButton,
  ChatMessage,
  MessageBoxScrollDownButton,
  MessageStack,
} from '@/components/Chat'
import { Web3AuthExtendedUser } from '@/components/Providers'
import { useAppDispatch, useAppSelector, useSocket } from '@/hooks'
import { useGetDiscussChatHistoryQuery } from '@/services/discuss'
import { addMessages, selectMessageHistory } from '@/slices/chat'
import { sha256 } from '@/utils'

interface SocketChatBoxProps {
  connection: string
  web3AuthUser: Web3AuthExtendedUser
  externalDraftMessage?: string
  sx?: SxProps
}

export function SocketChatBox(props: SocketChatBoxProps) {
  const { connection, web3AuthUser, externalDraftMessage } = props

  const dispatch = useAppDispatch()

  const selfMessageHistory = useAppSelector(selectMessageHistory(connection))

  const prevExternalDraftMessage = useRef<string>('')

  const socket = useSocket({
    namespace: 'chat',
    jwtToken: web3AuthUser.idToken,
    autoJoin: true,
    autoJoinChannel: connection,
  })

  const userSelfTag = useMemo(() => {
    if (!web3AuthUser || !web3AuthUser.email) return 'loading'
    return sha256(web3AuthUser.email)
  }, [web3AuthUser])

  // const {
  //   data: fetchedChatHistory,
  //   error: fetchErrorChatHistory,
  //   isLoading: isChatHistoryLoading,
  //   isFetching: isChatHistoryFetching,
  //   isError: isChatHistoryError,
  // } = useGetDiscussChatHistoryQuery(
  //   { appPubkey: web3AuthUser.appPubkey },
  //   {
  //     skip: !connection,
  //   },
  // )
  useGetDiscussChatHistoryQuery(
    { appPubkey: web3AuthUser.appPubkey },
    {
      skip: !connection,
    },
  )

  const chatMessagesRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  // if true, auto-scroll to bottom of chat box when messages are added
  const [isFollowingMessages, setIsFollowingMessages] = useState(true)

  const [draftMessage, setDraftMessage] = useState('')
  const [isChatDisabled, setIsChatDisabled] = useState(false)
  const [initiated, setInitiated] = useState(false)

  const handleSendMessage = useCallback(
    (message?: string) => () => {
      const _message = message || draftMessage
      if (!socket || !_message || isChatDisabled) return
      setIsChatDisabled(true)

      // Send current message (only the current message) to server
      socket.emit('chat', { message: _message, connection })

      dispatch(
        addMessages({
          connection,
          messages: [
            {
              role: 'user',
              content: _message,
              createdAt: Math.floor(Date.now() / 1000), // ms to seconds
              tag: userSelfTag,
            },
          ],
        }),
      )

      setDraftMessage('')
      setIsChatDisabled(false)
    },
    [draftMessage, socket, isChatDisabled, connection, dispatch, userSelfTag],
  )

  const handleKeyPressSendMessage = (
    e: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSendMessage()() // handleSendMessage() returns a callable function
    }
  }

  const onMessageBoxScroll = useCallback(() => {
    if (chatMessagesRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatMessagesRef.current
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 60 // 60 is leeway

      if (isNearBottom) {
        setIsFollowingMessages(true)
      } else if (isFollowingMessages) {
        setIsFollowingMessages(false)
      }
    }
  }, [chatMessagesRef, isFollowingMessages])

  useEffect(() => {
    if (
      !!externalDraftMessage &&
      prevExternalDraftMessage.current !== externalDraftMessage
    ) {
      prevExternalDraftMessage.current = externalDraftMessage
      setDraftMessage(externalDraftMessage)
    }
  }, [externalDraftMessage])

  useEffect(() => {
    if (!socket || !web3AuthUser || initiated) return

    // remove any existing socket listeners before re-adding them
    socket.off('connect')
    socket.off('disconnect')

    socket.on('connect', () => {
      socket.connected = true
      // console.log('socket connected')
      setInitiated(true)
    })
    socket.on('disconnect', () => {
      socket.connected = false
      // console.log('socket disconnected')
    })

    socket.off('chat_message') // remove all other same listener before adding below
    socket.on(
      'chat_message',
      ({
        connection,
        tag,
        message,
      }: {
        connection: string
        tag: string
        message: string
      }) => {
        // console.log('chat_message', connection, from, message)
        if (message) {
          // if (from === sha256(web3AuthUser.email || '')) return
          if (tag === userSelfTag) return
          dispatch(
            addMessages({
              connection,
              messages: [
                {
                  role: 'user',
                  content: message,
                  createdAt: Math.floor(Date.now() / 1000), // ms to seconds
                  tag,
                },
              ],
            }),
          )
        }
      },
    )
  }, [socket, web3AuthUser, dispatch, initiated, userSelfTag])

  // Scroll to Bottom of Chat at initial load
  useEffect(() => {
    if (chatMessagesRef.current)
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
  }, [chatMessagesRef])

  // Scroll to Bottom of Chat box when messages are added
  useEffect(() => {
    if (messagesEndRef.current && isFollowingMessages)
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [selfMessageHistory, messagesEndRef, isFollowingMessages])

  useEffect(() => {
    const refCur = chatMessagesRef.current
    if (refCur) {
      refCur.addEventListener('scroll', onMessageBoxScroll)

      return () => {
        if (refCur) refCur.removeEventListener('scroll', onMessageBoxScroll)
      }
    }
  }, [onMessageBoxScroll])

  return (
    <>
      <Stack
        position="absolute"
        top={0}
        right={0}
        bottom={0}
        left={0}
        alignItems="flex-stretch"
        justifyContent="flex-end"
        width="100%"
        // maxWidth={{ xs: '100%', md: 650 }}
        pb={0.5}
        pr={1.5}
        // border="1px solid #eee"
        // borderRadius={4}
        // px={3}
        // py={2}
        sx={props.sx}
      >
        <MessageStack spacing={1} ref={chatMessagesRef}>
          {selfMessageHistory.map((message, idx) => (
            <ChatMessage
              key={idx}
              messageOrBlock={message.content}
              senderRole={message.role}
              // user={web3AuthUser.email || ''}
              createdAt={message.createdAt}
              tag={message.tag}
              selfTag={userSelfTag}
              // pfp={web3AuthUser.profileImage}
              chatWidth="80%"
            />
          ))}
          <Box ref={messagesEndRef} />
        </MessageStack>
        <Box position="relative">
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="flex-start"
            px={1}
            pt={1}
            pb={0.5}
            width="100%"
            bgcolor="#fff"
            borderRadius={2}
            boxShadow="0 0 10px rgba(0,0,0,0.10)"
            border="1px solid #e4e5e6"
          >
            <InputBase
              multiline
              minRows={1}
              maxRows={6}
              sx={{ px: 1, flex: 1, mr: 1 }}
              placeholder="Send a message"
              value={draftMessage}
              onChange={(e) => setDraftMessage(e.target.value)}
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              onKeyDown={handleKeyPressSendMessage}
              disabled={isChatDisabled}
              fullWidth
            />
            <ChatSideIconButton
              type="button"
              onClick={handleSendMessage()} // handleSendMessage() returns a callable function
              disabled={isChatDisabled}
              // source for tracking
              source="discuss"
              aria-label="Send message"
            >
              <SendOutlinedIcon fontSize="small" />
            </ChatSideIconButton>
          </Stack>
        </Box>
      </Stack>
      <MessageBoxScrollDownButton
        display={isFollowingMessages ? 'none' : 'inline-block'}
        onClick={() => setIsFollowingMessages(true)}
        aria-label="Scroll to bottom of chat"
      >
        <ExpandMoreIcon fontSize="medium" />
      </MessageBoxScrollDownButton>
    </>
  )
}
