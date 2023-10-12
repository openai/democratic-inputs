import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft'
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight'
import { Box, Modal, Stack, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useMemo, useState } from 'react'
import { useTracking } from 'react-tracking'

import {
  AiChatBox,
  GotoLinkButton,
  LikertScaleSurvey,
  LoadingScreen,
  ValueQuestionBox,
} from '@/components'
import { useAppSelector, useWeb3Auth } from '@/hooks'
import { selectUserData } from '@/slices/user'
import { sha256 } from '@/utils'
import surveyQuestions from '@/data/surveyQuestions'

const MenuTriggerButton = styled(Box)({
  height: 38,
  width: 38,
  padding: '5px 5px 5px 7px',
  backgroundColor: '#edf7ff',
  borderRadius: '20px',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#D9EDFD', // BCE0FD
  },
})

export default function IndexPage() {
  useTracking({ page: 'Home' })

  const web3Auth = useWeb3Auth()
  const userData = useAppSelector(selectUserData)

  const [isIntroOpen, setIsIntroOpen] = useState(true)
  const [isSurveyOpen, setIsSurveyOpen] = useState(false)

  const valueQuestionId = 0

  const valueQuestion = useMemo(() => {
    if (
      !web3Auth ||
      web3Auth.isLoading ||
      web3Auth.isFetching ||
      !web3Auth.userPod
    )
      return
    // search value questions in userpod matching the id of `valueQuestionId`
    return web3Auth.userPod.valueQuestion[valueQuestionId]
  }, [web3Auth])

  if (
    !web3Auth.isReady ||
    (web3Auth.isReady && !web3Auth.isAuthenticated) ||
    !web3Auth ||
    !web3Auth.user ||
    !web3Auth.userPod ||
    !userData ||
    !userData.user ||
    !valueQuestion
  ) {
    return <LoadingScreen />
  }
  return (
    <>
      <Stack direction="row" spacing={4} alignItems="stretch" flex={1}>
        <Box
          position="relative"
          bgcolor="#f7f9fc"
          borderRadius={4}
          p={isIntroOpen ? 4 : 0}
          width={isIntroOpen ? '100%' : 'auto'}
          maxWidth={{ xs: '100%', md: 360 }}
          sx={{ transition: 'width 0.1s ease-in-out' }}
        >
          {isIntroOpen ? (
            <>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="h5" fontWeight="bold">
                  Welcome
                </Typography>
                <MenuTriggerButton onClick={() => setIsIntroOpen(false)}>
                  <KeyboardDoubleArrowLeftIcon />
                </MenuTriggerButton>
              </Stack>
              <Typography variant="body1" mt={1} fontSize="0.92rem">
                You are participating in a research study. We aim to build a
                tool that enables users to contribute input for shaping future
                AI rules. Please converse with ChatGPT in the middle panel and
                ask any questions you have about this AI topic, share any
                preferences and expectations that you have.
              </Typography>
              <Typography variant="body1" mt={2} fontSize="0.92rem">
                Once you finish your conversation with ChatGPT on this topic,
                please click the button on the left panel to fill out a survey.
                Thank you!
              </Typography>

              <Box mt={3}>
                <GotoLinkButton href="/discuss" sx={{ width: '100%' }}>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    aria-label="Discuss with Others"
                  >
                    👥&nbsp;&nbsp;Discuss with Others
                  </Typography>
                </GotoLinkButton>
              </Box>

              <Box mt={2}>
                <ValueQuestionBox href="/vote">
                  <Typography
                    variant="body2"
                    color="#999"
                    aria-label="Vote on Topic"
                  >
                    ⚡&nbsp;&nbsp;Vote on Topic
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {valueQuestion.topic}
                  </Typography>
                  {/* <Typography variant="subtitle2" pt={1} color="#555">
                    {valueQuestion.question}
                  </Typography> */}
                </ValueQuestionBox>
              </Box>
              {/* {userData.user.aiSurveyCompleted ? (
                <>
                  <Box mt={3}>
                    <GotoLinkButton href="/discuss" sx={{ width: '100%' }}>
                      <Typography variant="body1" fontWeight="bold">
                        👥&nbsp;&nbsp;Discuss with Others
                      </Typography>
                    </GotoLinkButton>
                  </Box>

                  <Box mt={2}>
                    <ValueQuestionBox href="/vote">
                      <Typography variant="body2" color="#999">
                        ⚡&nbsp;&nbsp;Vote on Topic
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {valueQuestion.topic}
                      </Typography>
                    </ValueQuestionBox>
                  </Box>
                </>
              ) : (
                <>
                  <Box mt={5}>
                    <GotoLinkButtonForModal
                      sx={{ width: '100%' }}
                      onClick={() => setIsSurveyOpen(true)}
                    >
                      <Typography variant="body1" fontWeight="bold">
                        💬&nbsp;&nbsp;Survey
                      </Typography>
                    </GotoLinkButtonForModal>
                  </Box>
                  <Typography variant="body2" color="#999" pt={2}>
                    We recommend you to chat with AI thoroughly for at least
                    <strong> 15 minutes </strong> before completing the survey.
                  </Typography>
                </>
              )} */}
            </>
          ) : (
            <MenuTriggerButton
              position="relative"
              onClick={() => setIsIntroOpen(true)}
              sx={{ height: '100%', paddingBottom: '20px' }}
            >
              <KeyboardDoubleArrowRightIcon
                style={{
                  position: 'relative',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
            </MenuTriggerButton>
          )}
        </Box>
        <Box position="relative" height="100%" width="100%">
          <AiChatBox
            isMainChat={true}
            connection={sha256(`${web3Auth.user.email}+${valueQuestionId}`)}
            web3AuthUser={web3Auth.user}
            promptSuggestions={
              [
                // 'What challenges do generative AI models face in avoiding stereotypes in image creation?',
                // `How can AI models be trained to provide diverse representations for underspecified prompts like 'a CEO' or 'a nurse'`,
                // 'What methods are being used to ensure unbiased outputs in generative AI models?',
                // 'What are some real-world implications of stereotypical outputs from generative AI models?',
                // 'Explain the importance of avoiding stereotypical depictions in AI-generated images.',
                // 'How can the balance between diversity and homogeneity be maintained in AI image generation?',
                // 'Describe the ethical considerations in designing AI models to avoid stereotypical representations.',
                // 'How can user feedback be integrated to ensure diversity in AI-generated images?'
                // 'What is the role of data selection in shaping the outputs of generative AI models?'
                // 'How can collaboration between AI developers, sociologists, and ethicists help in mitigating stereotypical outputs in AI-generated imagery?'
              ]
            }
          />
        </Box>
      </Stack>
      <Modal
        keepMounted
        open={isSurveyOpen}
        onClose={() => setIsSurveyOpen(false)}
        sx={{ p: 3, display: isSurveyOpen ? 'block' : 'none' }}
      >
        <Box
          position="absolute"
          top="50%"
          left="50%"
          maxWidth={600}
          width="100%"
          bgcolor="background.paper"
          borderRadius={4}
          boxShadow="0 0 20px 1px rgba(130,130,130,0.13)"
          sx={{
            transform: 'translate(-50%, -50%)',
          }}
        >
          <LikertScaleSurvey
            appPubkey={web3Auth.user.appPubkey}
            surveyTitle="AI-discussion Survey"
            surveyDescription="Please indicate your level of agreement with the following statements. 1 means strongly disagree, 5 means strongly agree"
            questions={surveyQuestions}
          />
        </Box>
      </Modal>
    </>
  )
}
