import { Box, Button, Stack, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useTracking } from 'react-tracking'

import { LoadingScreen, SocketChatBox, ValueQuestionBox } from '@/components'
import { useAppSelector, useWeb3Auth } from '@/hooks'
import { selectUserData } from '@/slices/user'
import { useState } from 'react'

const discussTopics: Record<string, string> = {
  'AI Image Representation':
    "What's your thought on AI portray different gender, age, color based on the prompt?",
  'Multiple image outcome':
    'What do you all think if AI could generate multiple images that represent a wide spectrum of society?',
  'Power and control in AI':
    'How do you all think if we had an option to customize the outcome iteratively that AI generates based on our first prompt?',
  'Balancing Stereotypes in AI':
    'Do you think there is risk of avoiding stereotype completely or reinforcing stereotype? How this should be balanced? ',
  'Appropriateness in social context':
    'Have you seen some of the AI-generated images? How do you feel about the way they stand or what they wear?',
  'Explainability of the image content':
    "Sometimes I look at AI-generated images and wonder what's going on. Do you think there should be a way for AI to explain the content it creates?",
  'Level of accuracy in generated image':
    'When you see an AI-generated image, what level of accuracy or realism do you expect?',
}

const DiscussTopicCardWrapper = styled(Box)({
  display: 'block',
  width: 'full',
  padding: '12px 10px',
  border: '1px solid #e3e4e5',
  borderRadius: 6,
  boxShadow: '0 0 20px 1px rgba(130,130,130,0.05)',
  textAlign: 'left',
  textDecoration: 'none',
  color: 'inherit',
  transition: 'box-shadow 0.2s ease-in-out',
  '&:hover': {
    // borderColor: theme.palette.primary.main,
    boxShadow: '0 0 20px 1px rgba(130,130,130,0.1)',
  },
})

interface DiscussTopicCard {
  topic: string
  suggestion: string
  active: boolean
  askQuestionHandler: () => void
  skipToNextHandler: () => void
}

function DiscussTopicCard(props: DiscussTopicCard) {
  return (
    <DiscussTopicCardWrapper
      // display={props.active ? 'block' : 'none'}
      sx={{
        display: props.active ? 'block' : 'none',
        opacity: props.active ? 1 : 0,
        transition: 'opacity 0.2s ease-in-out',
      }}
    >
      <Box px={1}>
        <Typography variant="body1" fontWeight="bold">
          [{props.topic}]
        </Typography>
        <Typography variant="body1">{props.suggestion}</Typography>
      </Box>
      <Stack direction="row" justifyContent="center" spacing={1} mt={2}>
        <Button
          variant="outlined"
          color="success"
          onClick={props.askQuestionHandler}
          fullWidth
        >
          <Typography variant="body1">Ask</Typography>
        </Button>
        <Button
          variant="outlined"
          color="info"
          onClick={props.skipToNextHandler}
          fullWidth
        >
          <Typography variant="body1">Next Topic</Typography>
        </Button>
      </Stack>
    </DiscussTopicCardWrapper>
  )
}

function DiscussTopicCardSelector({
  topics,
  setSuggestedQuestion,
}: {
  topics: Record<string, string>
  setSuggestedQuestion: React.Dispatch<React.SetStateAction<string>>
}) {
  const [cardIndex, setCardIndex] = useState(0)
  const topicsLen = Object.keys(topics).length

  return (
    <>
      <Typography variant="body1" fontWeight="bold" mb={1}>
        Suggested Topics
      </Typography>
      {Object.keys(topics).map((topic, idx) => (
        <DiscussTopicCard
          key={topic + topics[topic]}
          topic={topic}
          suggestion={topics[topic]}
          active={cardIndex === idx}
          askQuestionHandler={() => setSuggestedQuestion(topics[topic])}
          skipToNextHandler={() => setCardIndex((idx + 1) % topicsLen)}
        />
      ))}
    </>
  )
}

export default function DiscussIndexPage() {
  useTracking({ page: 'Discuss' })

  const web3Auth = useWeb3Auth()
  const userData = useAppSelector(selectUserData)

  const [suggestedQuestion, setSuggestedQuestion] = useState('')

  if (
    !web3Auth ||
    !web3Auth.isReady ||
    (web3Auth.isReady && !web3Auth.isAuthenticated) ||
    !web3Auth.user ||
    !web3Auth.userPod ||
    !userData ||
    !userData.user ||
    !userData.pod.valueQuestion ||
    !userData.pod.valueQuestion[0]
  ) {
    // console.log('loading')
    return <LoadingScreen />
  }

  // if (userData && !userData.user.aiSurveyCompleted) {
  //   return (
  //     <Stack alignItems="center" spacing={1}>
  //       <Typography variant="h4" fontWeight="bold">
  //         Complete the AI-discussion Survey.
  //       </Typography>
  //       <Typography variant="h6" color="#999">
  //         Once completing the survey, you can join the group discussion with
  //         other users!
  //       </Typography>
  //       <Box pt={4}>
  //         <GotoLinkButton href="/">
  //           <Typography variant="body1" fontWeight="bold">
  //             💬&nbsp;&nbsp;Chat with Assistant
  //           </Typography>
  //         </GotoLinkButton>
  //       </Box>
  //     </Stack>
  //   )
  // }

  return (
    <Stack
      direction="row"
      spacing={4}
      alignItems="stretch"
      flex={1}
      height="100%"
    >
      <Box
        bgcolor="#f7f9fc"
        borderRadius={4}
        p={4}
        width="100%"
        maxWidth={{ xs: '100%', md: 360 }}
      >
        <Typography variant="h5" fontWeight="bold">
          Discuss with Others
        </Typography>
        <Typography variant="body1" pt={1}>
          Chat with other members in your group about the topic.
        </Typography>
        <Box mt={3}>
          <DiscussTopicCardSelector
            topics={discussTopics}
            setSuggestedQuestion={setSuggestedQuestion}
          />
        </Box>
        <Box mt={3}>
          <ValueQuestionBox href="/vote">
            <Typography variant="body2" color="#999" aria-label="Vote on Topic">
              ⚡&nbsp;&nbsp;Vote on Topic
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {userData.pod.valueQuestion[0].topic}
            </Typography>
            {/* <Typography variant="subtitle2" pt={1} color="#555">
              {userData.pod.valueQuestion[0].question}
            </Typography> */}
          </ValueQuestionBox>
        </Box>
      </Box>
      <Box position="relative" height="100%" width="100%">
        <SocketChatBox
          connection={`pod-${web3Auth.userPod.id}`}
          web3AuthUser={web3Auth.user}
          externalDraftMessage={suggestedQuestion}
          sx={{ height: '100%' }}
        />
      </Box>
    </Stack>
  )
}
