import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SendOutlinedIcon from '@mui/icons-material/SendOutlined'
import {
  Box,
  Stack,
  Grid,
  InputBase,
  Typography,
  Button,
  SxProps,
} from '@mui/material'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import dalleNurseHelpingCEO from '@/assets/images/dalle-nurse-helping-ceo.png'
import {
  ChatSideIconButton,
  ChatMessage,
  MessageBoxScrollDownButton,
  MessageStack,
  PromptSuggestion,
} from '@/components/Chat'
import { Web3AuthExtendedUser } from '@/components/Providers'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { useGetAiChatHistoryQuery, usePostAiChatMutation } from '@/services/ai'
import { addMessages, selectMessageHistory } from '@/slices/chat'
import { ChatDialogue } from '@/types'
import { sha256 } from '@/utils'

interface AiChatBoxProps {
  connection: string
  web3AuthUser: Web3AuthExtendedUser
  promptSuggestions: string[]
  isMainChat?: boolean
  sx?: SxProps
}

export function AiChatBox(props: AiChatBoxProps) {
  const { connection, web3AuthUser, promptSuggestions } = props

  const dispatch = useAppDispatch()

  const selfMessageHistory = useAppSelector(selectMessageHistory(connection))

  const userSelfTag = useMemo(() => {
    if (!web3AuthUser || !web3AuthUser.email) return 'loading'
    return sha256(web3AuthUser.email)
  }, [web3AuthUser])

  const chatMessagesRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  // if true, auto-scroll to bottom of chat box when messages are added
  const [isFollowingMessages, setIsFollowingMessages] = useState(true)

  const [showInitialImage, setShowInitialImage] = useState(
    selfMessageHistory.length > 0,
  )
  const [answeredInitialImage, setAnsweredInitialImage] = useState(
    selfMessageHistory.length > 0,
  )

  const [postAiChat, postAiChatResult] = usePostAiChatMutation()

  // const {
  //   data: fetchedChatHistory,
  //   error: fetchErrorChatHistory,
  //   isLoading: isChatHistoryLoading,
  //   isFetching: isChatHistoryFetching,
  //   isError: isChatHistoryError,
  // } = useGetAiChatHistoryQuery(
  //   { appPubkey: web3AuthUser.appPubkey, connection },
  //   {
  //     skip: !connection,
  //   },
  // )
  useGetAiChatHistoryQuery(
    { appPubkey: web3AuthUser.appPubkey, connection },
    {
      skip: !connection,
    },
  )

  const [draftMessage, setDraftMessage] = useState('')
  const [isChatDisabled, setIsChatDisabled] = useState(false)

  const handleSendMessage = useCallback(
    (message?: string) => () => {
      const _message = message || draftMessage
      // console.log('handleSendMessage', _message)
      if (!_message || isChatDisabled) return
      setIsChatDisabled(true)

      const currentMessage: ChatDialogue = {
        role: 'user' as const,
        content: _message,
        createdAt: Math.floor(Date.now() / 1000),
      }

      postAiChat({
        appPubkey: web3AuthUser.appPubkey,
        connection,
        dialogue: currentMessage,
        location: props.isMainChat ? 'main-chat' : 'vote-ask',
      })

      dispatch(
        addMessages({
          connection,
          messages: [currentMessage],
        }),
      )
      setDraftMessage('Waiting for response...') // for self rooms
    },
    [
      draftMessage,
      web3AuthUser,
      isChatDisabled,
      props.isMainChat,
      postAiChat,
      dispatch,
      connection,
    ],
  )

  const handleKeyPressSendMessage = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        // handleSendMessage() returns a callable function
        handleSendMessage()()
      }
    },
    [handleSendMessage],
  )

  const answerInitialImage = useCallback(
    (text: string) => {
      if (answeredInitialImage) return
      console.log(answeredInitialImage)
      setAnsweredInitialImage(true)
      handleSendMessage(text)()
    },
    [handleSendMessage, answeredInitialImage],
  )

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
    if (!postAiChatResult) return
    const { data, error, isError, isLoading } = postAiChatResult

    if (isError) {
      console.error(error)
      setDraftMessage('Error...')
    }
    if (!isLoading && !!data && !!data.dialogue) {
      // Message is added in `extraReducers` of `chat` reducer
      setDraftMessage('')
      setIsChatDisabled(false)
    }
  }, [postAiChatResult])

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
        alignItems="flex-stretch"
        justifyContent="flex-end"
        width="100%"
        pb={0.5}
        pr={0.5}
        // border="1px solid #eee"
        // borderRadius={6}
        // px={3}
        // py={2}
        sx={
          props.isMainChat
            ? {
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                ...props.sx,
              }
            : props.sx
        }
      >
        <MessageStack spacing={2} ref={chatMessagesRef}>
          {props.isMainChat &&
            !selfMessageHistory.length &&
            !showInitialImage && (
              <>
                <ChatMessage
                  messageOrBlock="You are part of a deliberation process around values that will help determine how ChatGPT should respond in different scenarios. \n\nReady to start?"
                  senderRole="assistant"
                />
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={() => setShowInitialImage(true)}
                  sx={{ maxWidth: 300, ml: '50px !important' }}
                >
                  Yes, let&apos;s start!
                </Button>
              </>
            )}
          {props.isMainChat && showInitialImage && (
            <ChatMessage
              messageOrBlock={
                <Box textAlign="left">
                  <Typography variant="body2" pb={2}>
                    This is an image generated by DALL-E when asked to draw
                    &quot;A nurse helping a CEO.&quot;
                  </Typography>
                  <Image
                    src={dalleNurseHelpingCEO.src}
                    alt="DALL-E 'A nurse helping a CEO' image"
                    aria-label="A white woman nurse wearing nurse uniform which is blue color. Nurse is not holding any medical equipment. There is a CEO who is asian, brown color skin, he wears white creme color shirt and black tie and black pant. The CEO has something mobile phone like device in his hand. He  is showing something to the nurse in the mobile phone like device. Nurse is standing very close to the CEO and kept her hand on CEO’s shoulder. There is white plain background behind them."
                    width={280}
                    height={
                      (280 / dalleNurseHelpingCEO.width) *
                      dalleNurseHelpingCEO.height
                    }
                    style={{ border: '1px solid #eee', borderRadius: '6px' }}
                  />
                  <Typography variant="body2" pt={2} fontWeight="bold">
                    Would you want this to be presented in a different way?
                  </Typography>
                </Box>
              }
              senderRole="assistant"
            />
          )}
          {props.isMainChat && showInitialImage && !answeredInitialImage && (
            <Stack
              direction="row"
              spacing={2}
              sx={{ ml: '50px !important ', pb: '10px' }}
            >
              <Button
                variant="contained"
                size="medium"
                color="success"
                onClick={() =>
                  answerInitialImage(
                    'I want this image to be presented in a differet way.',
                  )
                }
                aria-label="Yes, I want this image to be presented in a different way."
              >
                Yes
              </Button>
              <Button
                variant="contained"
                size="medium"
                color="error"
                onClick={() =>
                  answerInitialImage(
                    'I want to maintain the presentation of the image.',
                  )
                }
                aria-label="No, I want to maintain the presentation of the image."
              >
                No
              </Button>
              <Button
                variant="contained"
                size="medium"
                color="primary"
                onClick={() =>
                  answerInitialImage(
                    'I do not know if I want the image to be presented in a different way.',
                  )
                }
                aria-label="I do not know if I want the image to be presented in a different way."
              >
                Maybe
              </Button>
            </Stack>
          )}
          {selfMessageHistory.map((message, idx) => (
            <ChatMessage
              key={idx}
              messageOrBlock={message.content}
              // user={web3AuthUser.email || ''}
              tag={userSelfTag}
              selfTag={userSelfTag}
              senderRole={message.role}
              // pfp={web3AuthUser.profileImage}
            />
          ))}
          <Box ref={messagesEndRef} />
        </MessageStack>
        {promptSuggestions.length > 0 && selfMessageHistory.length == 0 && (
          <Grid
            container
            spacing={2}
            maxWidth="100%"
            overflow="hidden"
            pb={props.isMainChat ? 14 : 8}
          >
            {promptSuggestions.map((prompt, idx) => (
              <Grid item xs={6} key={idx}>
                <PromptSuggestion
                  onClick={() => {
                    setDraftMessage(prompt)
                    // need to pass in `prompt` because `setDraftMessage` state updates after calling `handleSendMessage` which uses stale draftMessage
                    handleSendMessage(prompt)()
                  }}
                >
                  <Typography variant="body2" key={prompt}>
                    {prompt}
                  </Typography>
                  <SendOutlinedIcon fontSize="small" />
                </PromptSuggestion>
              </Grid>
            ))}
          </Grid>
        )}
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
              onKeyDown={handleKeyPressSendMessage}
              disabled={isChatDisabled}
              fullWidth
              aria-label="Message to AI assistant"
            />
            <ChatSideIconButton
              type="button"
              onClick={handleSendMessage()} // handleSendMessage() returns a callable function
              disabled={isChatDisabled}
              // source for tracking
              source={`ai-${props.isMainChat ? 'main' : 'alt'}`}
              aria-label="Send message"
            >
              <SendOutlinedIcon fontSize="small" />
            </ChatSideIconButton>
            {/* <ChatSideIconButton
              type="button"
              // onClick={handleSendMessage()}
            >
              <QuestionMarkIcon fontSize="small" />
            </ChatSideIconButton> */}
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
