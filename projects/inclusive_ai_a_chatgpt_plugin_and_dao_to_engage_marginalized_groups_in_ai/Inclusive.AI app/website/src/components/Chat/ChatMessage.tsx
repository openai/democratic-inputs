import { Avatar, Box, Stack, Typography } from '@mui/material'
import React from 'react'

import chatGptLogo from '@/assets/images/chat-gpt-logo.png'
import { SelectShowOnHoverBox } from '@/components'
import { timestampToChatDateString } from '@/utils'

export interface ChatMessageProps {
  messageOrBlock: string | React.ReactNode
  senderRole: string
  // user: string
  createdAt?: number
  tag?: string
  selfTag?: string
  chatWidth?: string | number
}

export function ChatMessage({
  messageOrBlock,
  senderRole,
  createdAt,
  tag,
  selfTag,
  chatWidth,
}: ChatMessageProps) {
  const pfpUrl =
    senderRole === 'user'
      ? `http://res.cloudinary.com/dkd5su87i/image/upload/v1/${tag}.jpg` // /v${Date.now()}/${tag}.jpg
      : chatGptLogo.src
  const isSelf = senderRole === 'user' && (!tag || tag === selfTag)
  const isAi = senderRole === 'assistant'
  return (
    <Box pl={1} pr={2}>
      {/* Need this Box for max width (parent Box has 100% as direct child of MessageStack) */}
      <Box
        maxWidth={{ xs: '100%', md: chatWidth ?? '100%' }}
        ml={!isSelf && !isAi ? 'auto' : 0}
      >
        <Stack
          width="100%"
          direction="row"
          alignItems="flex-start"
          justifyContent={!isSelf && !isAi ? 'flex-end' : 'flex-start'}
          spacing={1.5}
          sx={{ cursor: 'default' }}
        >
          {(isSelf || isAi) && (
            <Avatar
              alt={senderRole === 'user' ? 'User' : 'Assistant'}
              src={pfpUrl}
              sx={{ width: 36, height: 36 }}
              // aria-label={senderRole === 'user' ? 'User Avatar' : 'Assistant Avatar'}
              style={{ border: '3px solid rgb(201, 230, 252)' }}
            />
          )}
          <SelectShowOnHoverBox textAlign={isSelf ? 'left' : 'right'}>
            {typeof messageOrBlock === 'string' ? (
              <Typography
                variant="body2"
                bgcolor={isSelf ? '#F7F9FC' : 'rgba(201, 230, 252, 0.7)'} // #CFE5FA
                py={1.5}
                px={2}
                borderRadius={2}
                whiteSpace="pre-line"
                textAlign="left" // override parent's alignment
              >
                {messageOrBlock.replace(/\\n/g, '\n')}
              </Typography>
            ) : (
              messageOrBlock
            )}
            {createdAt && (
              <Box className="select-show-on-hover-box" ml={2}>
                <Typography variant="caption" color="#999" lineHeight={0}>
                  Sent&nbsp;&nbsp;{timestampToChatDateString(createdAt)}
                </Typography>
              </Box>
            )}
          </SelectShowOnHoverBox>
          {!isSelf && !isAi && (
            <Avatar
              alt={tag}
              src={pfpUrl}
              sx={{ width: 36, height: 36 }}
              style={{ border: '3px solid rgb(201, 230, 252)' }}
            />
          )}
        </Stack>
      </Box>
    </Box>
  )
}
