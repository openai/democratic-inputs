import { Wallet } from '@ethersproject/wallet'
import { Web3Provider } from '@ethersproject/providers'
import CloseIcon from '@mui/icons-material/Close'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import { Box, Button, Modal, Stack, Typography } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTracking } from 'react-tracking'

import type { ProposalChoice } from '@/components'
import {
  AiChatBox,
  GotoLinkButton,
  GotoLinkButtonForModal,
  LikertScaleSurvey,
  LoadingScreen,
  ModalInnerBox,
  ProposalQuadraticVote,
  ProposalRankVote,
  ProposalUserVotes,
  VoteStats,
  VotingIntro,
} from '@/components'
import {
  useAppDispatch,
  useAppSelector,
  useSnapshotProposalData,
  useWeb3Auth,
} from '@/hooks'
import { selectUserData } from '@/slices/user'
import { getUserVp, sha256, snapshotClient } from '@/utils'
import surveyQuestions from '@/data/surveyQuestions'
import {
  selectCompletedVotingIntro,
  selectHasVoted,
  setHasVoted,
} from '@/slices/app'
import { useSnapshotUserVotes } from '@/hooks/useSnapshotUserVotes'
import { SnapshotUserVotes } from '@/types'

export default function VoteIndexPage() {
  useTracking({ page: 'Vote' })

  const web3Auth = useWeb3Auth()
  const dispatch = useAppDispatch()

  const userData = useAppSelector(selectUserData)
  const hasVoted = useAppSelector(selectHasVoted)
  const completedVotingIntro = useAppSelector(selectCompletedVotingIntro)

  const valueQuestionIndex = 0 // hard-code to the first value question (since there's only one)

  const valueQuestion = useMemo(() => {
    if (
      !web3Auth ||
      web3Auth.isLoading ||
      web3Auth.isFetching ||
      !web3Auth.userPod
    )
      return
    // todo: search to match the current value topic's question
    return web3Auth.userPod.valueQuestion[valueQuestionIndex]
  }, [web3Auth])

  const [isSubmittingVote, setIsSubmittingVote] = useState(false)
  const [isSubmittingError, setIsSubmittingError] = useState(false)
  const [isSubmittingSuccess, setIsSubmittingSuccess] = useState(false)

  const [isAskModalOpen, setIsAskModalOpen] = useState(false)
  const [isSurveyOpen, setIsSurveyOpen] = useState(false)
  const [isVotingSystemModalOpen, setIsVotingSystemModalOpen] = useState(false)
  const [isVotingPurposeModalOpen, setIsVotingPurposeModalOpen] =
    useState(false)

  const {
    proposal,
    votes,
    isLoading: isProposalLoading,
    setSnapshotForceRefetch,
  } = useSnapshotProposalData(valueQuestion?.snapshotId)

  const [userVotingPower, setUserVotingPower] = useState<number>(0)

  const proposalChoices = useMemo(() => {
    if (!proposal) return []
    return proposal.choices.reduce(
      // choice is 1-indexed
      (arr, choice, idx) => arr.concat({ choice, index: idx + 1 }),
      [] as ProposalChoice[],
    )
  }, [proposal])

  // console.log(userData)
  const userSnapshotVotesRaw = useSnapshotUserVotes({
    proposalId: proposal?.id,
    userAddress: userData.user.address,
    // userAddress: '0x27DEbBa02dc062d2448D2F9DAFda627107dbCd82',
  })

  const userProposalVotes = useMemo<ProposalUserVotes>(
    () =>
      userSnapshotVotesRaw.userVotes && userSnapshotVotesRaw.userVotes[0]
        ? Object.keys(userSnapshotVotesRaw.userVotes[0].choice).reduce(
            (arr, key) => ({
              ...arr,
              [key]: (userSnapshotVotesRaw.userVotes as SnapshotUserVotes)[0]
                .choice[key],
            }),
            {},
          )
        : {},
    [userSnapshotVotesRaw.userVotes],
  )

  const voteOnProposal = useCallback(
    async (userProposalVotes: ProposalUserVotes) => {
      // console.log(userProposalVotes)
      setIsSubmittingVote(true)
      setIsSubmittingError(false)
      setIsSubmittingSuccess(false)

      if (
        isSubmittingVote ||
        !web3Auth ||
        !web3Auth.user ||
        !web3Auth.provider ||
        !valueQuestion ||
        !valueQuestion.snapshotId ||
        !valueQuestion.snapshotSpace ||
        !proposal
        // Object.values(userProposalVotes).every((x) => !x)
      ) {
        setIsSubmittingVote(false)
        return
      }

      // https://web3auth.io/docs/connect-blockchain/optimism#send-transaction
      const provider = new Web3Provider(web3Auth.provider)
      const signer = provider.getSigner()
      const userAddr = await signer.getAddress()

      try {
        // await snapshotClient.follow(signer as unknown as Wallet, userAddr, {
        //   space: valueQuestion.snapshotSpace,
        // })

        const res = (await snapshotClient.vote(
          signer as unknown as Wallet,
          userAddr,
          {
            space: valueQuestion.snapshotSpace,
            type: valueQuestion.snapshotType,
            proposal: valueQuestion.snapshotId,
            choice: userProposalVotes,
            app: 'inclusive-ai',
            // reason: '',
            // metadata: JSON.stringify({}),
            // from: userAccount,
            // timestamp: Math.floor(Date.now() / 1000),
          },
        )) as {
          id: string
          ipfs: string
          relayer: { address: string; receipt: string }
        }

        if (res.id && res.relayer) {
          setIsSubmittingSuccess(true)
          setSnapshotForceRefetch(true)
          dispatch(setHasVoted(true))
        }
      } catch (err) {
        console.error(err)
        setIsSubmittingSuccess(true) // test
        setIsSubmittingError(false)
      } finally {
        setTimeout(() => {
          setIsSubmittingVote(false)
          setIsSubmittingError(false)
          setIsSubmittingSuccess(false)
        }, 2000)
      }
    },
    [
      proposal,
      valueQuestion,
      web3Auth,
      isSubmittingVote,
      setSnapshotForceRefetch,
      dispatch,
    ],
  )

  useEffect(() => {
    const fetchUserVotes = async () => {
      if (!web3Auth || !web3Auth.user || !web3Auth.provider) return
      if (!valueQuestion || !valueQuestion.snapshotId) return

      const provider = await new Web3Provider(web3Auth.provider)
        .getSigner()
        .getAddress()

      const vp = await getUserVp(provider, valueQuestion.snapshotId)
      setUserVotingPower(vp.vp)
    }
    fetchUserVotes()
  }, [web3Auth, valueQuestion])

  // useEffect(() => {
  //   // Auth
  //   if (web3Auth.isReady && !web3Auth.isAuthenticated) {
  //     router.replace({ pathname: '/', query: router.query })
  //     return
  //   }
  // }, [web3Auth, router])

  if (
    !web3Auth.isReady ||
    (web3Auth.isReady && !web3Auth.isAuthenticated) ||
    !web3Auth ||
    !web3Auth.user ||
    !web3Auth.userPod ||
    !userData ||
    !userData.user ||
    // fetchedUserData?.payload?.pod.id !== userData.pod.id ||
    // fetchedUserData?.payload?.user.id !== userData.user.id ||
    !valueQuestion ||
    isProposalLoading
  ) {
    return <LoadingScreen />
  }

  if (!proposal) {
    return (
      <Stack alignItems="center" spacing={1}>
        <Typography variant="h4" fontWeight="bold">
          Voting is not live yet!
        </Typography>
        <Typography variant="h6" color="#999">
          Please come back later
        </Typography>
        <Box pt={4}>
          <GotoLinkButton href="/discuss">
            <Typography
              variant="body1"
              fontWeight="bold"
              aria-label="Discuss with Others"
            >
              👥&nbsp;&nbsp;Discuss with Others
            </Typography>
          </GotoLinkButton>
        </Box>
        <Box pt={1}>
          <GotoLinkButton href="/">
            <Typography
              variant="body1"
              fontWeight="bold"
              aria-label="Chat with Assistant"
            >
              💬&nbsp;&nbsp;Chat with Assistant
            </Typography>
          </GotoLinkButton>
        </Box>
      </Stack>
    )
  }

  // if (userData && !userData.user.aiSurveyCompleted) {
  //   return (
  //     <>
  //       <Stack alignItems="center" spacing={1}>
  //         <Typography variant="h4" fontWeight="bold">
  //           Complete the survey.
  //         </Typography>
  //         <Typography variant="h6" color="#999">
  //           Once you complete the survey, vote on the value topic!
  //         </Typography>
  //         <Stack spacing={2} pt={4}>
  //           <GotoLinkButtonForModal onClick={() => setIsSurveyOpen(true)}>
  //             <Typography variant="body1" fontWeight="bold">
  //               💬&nbsp;&nbsp;Survey
  //             </Typography>
  //           </GotoLinkButtonForModal>
  //           <GotoLinkButton href="/">
  //             <Typography variant="body1" fontWeight="bold">
  //               💬&nbsp;&nbsp;Chat with Assistant
  //             </Typography>
  //           </GotoLinkButton>
  //         </Stack>
  //       </Stack>
  //       <Modal
  //         keepMounted
  //         open={isSurveyOpen}
  //         onClose={() => setIsSurveyOpen(false)}
  //         sx={{ p: 3, display: isSurveyOpen ? 'block' : 'none' }}
  //       >
  //         <Box
  //           position="absolute"
  //           top="50%"
  //           left="50%"
  //           maxWidth={600}
  //           width="100%"
  //           bgcolor="background.paper"
  //           borderRadius={3}
  //           boxShadow="0 0 20px 1px rgba(130,130,130,0.13)"
  //           sx={{
  //             transform: 'translate(-50%, -50%)',
  //           }}
  //         >
  //           <LikertScaleSurvey
  //             appPubkey={web3Auth.user.appPubkey}
  //             surveyTitle="AI-discussion Survey"
  //             surveyDescription="Please indicate your level of agreement with the following statements. 1 means strongly disagree, 5 means strongly agree"
  //             questions={surveyQuestions}
  //           />
  //         </Box>
  //       </Modal>
  //     </>
  //   )
  // }

  if (!completedVotingIntro) {
    return (
      <VotingIntro
        votingType={proposal.type}
        userVotingPower={userVotingPower}
      />
    )
  }

  const proposalTypeReadable =
    proposal.type === 'quadratic' ? 'Quadratic' : 'Ranked'

  return (
    <>
      <Box top={-10}>
        <Box bgcolor="#edf7ff" py={2} px={3} borderRadius={3}>
          <Typography variant="body1">
            Your vote plays a crucial role in shaping the future of AI. It helps
            ensure fairness for you and the broader community in AI usage. AI
            companies will take this into consideration. In this proposal, there
            are <b>four potential solutions</b> (options) presented. You have{' '}
            <b>{userVotingPower} votes</b> to allocate among those choices.
          </Typography>
          {userData.user.votingEarly && (
            <Typography variant="body1" mt={1}>
              You are one of the <b>20%</b> of the members in this group that
              have <b>more voting power</b> than the remaining 80% of the
              members.
            </Typography>
          )}
        </Box>
      </Box>
      <Stack
        direction={{ xs: 'column-reverse', md: 'row' }}
        spacing={{ xs: 4, md: 6 }}
        alignItems="stretch"
      >
        <Box flex={2}>
          <Box border="1px solid #e7e9ec" borderRadius={3} p={3}>
            {/* <Typography variant="h5" fontWeight="bold" align="justify">
              {proposal.title}
            </Typography> */}
            {/* <Typography variant="body1" mt={2} whiteSpace="pre-line">
              {proposal.body}
            </Typography> */}
            <Typography variant="h5" fontWeight="bold" align="justify">
              [Proposal 1: Update Current Model for AI]
            </Typography>
            <Typography variant="body1" mt={4}>
              <b>Objective</b>: To improve AI models such as, Midjourney and
              DALL-E that automatically generate images based on user requests,
              we want to find ways to make these AI models generate high-quality
              content without potential biases.
            </Typography>
            <Typography variant="body1" mt={4}>
              <b>Example Context</b>: Imagine you asked an AI system to generate
              an image using a simple prompt like &quot;CEO&quot; or
              &quot;nurse.&quot; Sometimes, the AI might not offer a wide range
              of different images or generate content that you prefer. We want
              to improve this.
            </Typography>
            <Typography variant="body1" mt={4}>
              <b>Please vote on how to update the AI model</b>:
            </Typography>
            <ol
              style={{
                listStyleType: 'decimal',
                marginTop: 8,
                marginLeft: 30,
              }}
            >
              <li style={{ padding: '4px 8px' }}>
                <b>Use the current model as is</b>: This means that the AI will
                continue to generate images the way it does now.
              </li>
              <li style={{ padding: '4px 8px' }}>
                <b>Use additional user information</b>: This means that the AI
                will use additional user information (e.g., the demographics of
                the user who&apos;s making the request) to generate a more
                diverse range of images.
              </li>
              <li style={{ padding: '4px 8px' }}>
                <b>Track and apply user preferences</b>: Here, the AI will keep
                track of user preferences as they use the AI system (e.g., which
                one of the generated images they prefer given a specific
                request). The AI will use these preferences to generate a wider
                variety of images.
              </li>
              <li style={{ padding: '4px 8px' }}>
                <b>Add specific flags or tags in the requests</b>: This allows
                users to add specific flags (e.g., excluding any additional
                objects in the generated images) or tags (e.g., different art
                styles) to their requests, guiding the AI to either personalize
                the results or offer a broader range of images.
              </li>
            </ol>
          </Box>
          {hasVoted && (
            <Box border="1px solid #e7e9ec" borderRadius={4} mt={5}>
              <Typography
                variant="body1"
                fontWeight="bold"
                py={2}
                px={3}
                borderBottom="1px solid #e7e9ec"
              >
                You have voted! You can edit your vote by re-casting below.
              </Typography>
              <Stack p={3} spacing={1}>
                {proposalChoices.map((choice) => (
                  <Typography key={choice.index}>
                    <b>{choice.choice}</b> — {userProposalVotes[choice.index]}{' '}
                    votes
                  </Typography>
                ))}
              </Stack>
            </Box>
          )}
          {proposal.type === 'quadratic' ? (
            <ProposalQuadraticVote
              choices={proposalChoices}
              userVp={userVotingPower}
              userProposalVotes={userProposalVotes}
              // proposalCastedVotes={proposal.votes}
              // proposalCastedScores={proposal.scores_total}
              voteOnProposal={voteOnProposal}
              isSubmittingVote={isSubmittingVote}
              isSubmittingError={isSubmittingError}
              isSubmittingSuccess={isSubmittingSuccess}
            />
          ) : (
            <ProposalRankVote
              choices={proposalChoices}
              userVp={userVotingPower}
              userProposalVotes={userProposalVotes}
              // proposalCastedVotes={proposal.votes}
              // proposalCastedScores={proposal.scores_total}
              voteOnProposal={voteOnProposal}
              isSubmittingVote={isSubmittingVote}
              isSubmittingError={isSubmittingError}
              isSubmittingSuccess={isSubmittingSuccess}
            />
          )}
          <Box border="1px solid #e7e9ec" borderRadius={3} p={3} mt={5}>
            {proposal && votes ? (
              <VoteStats proposal={proposal} votes={votes} />
            ) : (
              <Typography variant="body1">Loading Proposal Stats...</Typography>
            )}
          </Box>
        </Box>
        <Box width="100%" maxWidth={{ xs: '100%', md: 360 }}>
          <Box border="1px solid #e7e9ec" borderRadius={3} p={3}>
            {hasVoted && (
              <Box mb={2}>
                {/* <GotoLinkButtonForModal onClick={() => setIsSurveyOpen(true)}>
                  <Typography variant="body1" fontWeight="bold">
                    💬&nbsp;&nbsp;Survey
                  </Typography>
                </GotoLinkButtonForModal> */}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setIsSurveyOpen(true)}
                  fullWidth
                >
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    aria-label="Take Survey"
                  >
                    💬&nbsp;&nbsp;Take Survey
                  </Typography>
                </Button>
              </Box>
            )}
            <Typography variant="body1" fontWeight="bold" mb={1}>
              Proposal Info
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="body1" color="#777">
                Voting system
              </Typography>
              <Stack
                direction="row"
                spacing={0.5}
                onClick={() => setIsVotingSystemModalOpen(true)}
                sx={{ cursor: 'pointer' }}
              >
                <Typography variant="body1">{proposalTypeReadable}</Typography>
                <HelpOutlineIcon />
              </Stack>
            </Stack>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="body1" color="#777">
                Start date
              </Typography>
              <Typography variant="body1">
                {new Date(proposal.start * 1000).toLocaleDateString()}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="body1" color="#777">
                End date
              </Typography>
              <Typography variant="body1">
                {new Date(proposal.end * 1000).toLocaleDateString()}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="body1" color="#777">
                Snapshot
              </Typography>
              <Typography variant="body1">
                {parseInt(proposal.snapshot).toLocaleString()}
              </Typography>
            </Stack>
          </Box>
          {/* <Box border="1px solid #e7e9ec" borderRadius={3} p={3} mt={3}>
            <Typography variant="body1" fontWeight="bold" mb={1}>
              Your Power
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="body1" color="#777">
                Available&nbsp;
                {proposal.type === 'quadratic' ? 'power' : 'votes'}
              </Typography>
              <Typography variant="body1">{userVotingPower}</Typography>
            </Stack>
          </Box> */}
          <Box mt={3}>
            <GotoLinkButtonForModal
              // sx={{ maxWidth: 400, m: '0 auto' }}
              onClick={() => setIsVotingPurposeModalOpen(true)}
            >
              <Typography
                variant="body1"
                fontWeight="bold"
                aria-label="What is Proposal and Vote?"
              >
                📚&nbsp;&nbsp;What is &quot;Proposal&quot; and &quot;Vote&quot;?
              </Typography>
            </GotoLinkButtonForModal>
          </Box>
          <Box mt={2}>
            <GotoLinkButton href="/discuss">
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
            <GotoLinkButtonForModal onClick={() => setIsAskModalOpen(true)}>
              <Typography
                variant="body1"
                fontWeight="bold"
                aria-label="Need Help with Voting?"
              >
                💬&nbsp;&nbsp;Need Help with Voting?
              </Typography>
            </GotoLinkButtonForModal>
          </Box>
          {/* <Box mt={2}>
            <GotoLinkButton
              href={`https://snapshot.org/#/${valueQuestion.snapshotSpace}/proposal/${valueQuestion.snapshotId}`}
              target="_blank"
            >
              <Typography variant="body1" fontWeight="bold">
                ⚡&nbsp;&nbsp;External Platform
              </Typography>
            </GotoLinkButton>
          </Box> */}
        </Box>
      </Stack>
      {/* AI Chat for voting system */}
      <Modal
        keepMounted
        open={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
        sx={{ p: 3, display: isAskModalOpen ? 'block' : 'none' }}
      >
        <ModalInnerBox>
          <Typography variant="body1" fontWeight="bold" textAlign="center">
            Ask AI any questions related to voting
          </Typography>
          <Typography variant="subtitle1" align="center" color="#777">
            (Click X or outside of this modal to return)
          </Typography>
          <Button
            onClick={() => setIsAskModalOpen(false)}
            aria-label="Close modal"
            sx={{ position: 'absolute', top: 15, right: 15 }}
          >
            <CloseIcon />
          </Button>
          <Box height={{ xs: 450, md: 400 }} mt={2}>
            <AiChatBox
              connection={sha256(
                `${web3Auth.user.email}+${valueQuestion.snapshotId}+ask`,
              )}
              web3AuthUser={web3Auth.user}
              promptSuggestions={[
                `What is ${proposalTypeReadable} Voting?`,
                `Can I change my vote later?`,
              ]}
              sx={{ height: '100%' }}
            />
          </Box>
        </ModalInnerBox>
      </Modal>
      {/* Info on proposal and vote */}
      <Modal
        open={isVotingPurposeModalOpen}
        onClose={() => setIsVotingPurposeModalOpen(false)}
        sx={{ p: 3 }}
      >
        <ModalInnerBox>
          <Typography variant="h6" fontWeight="bold" textAlign="center">
            Proposal and Vote
          </Typography>
          <Typography variant="body1" mt={3}>
            You were asked: <b>{valueQuestion.question}</b>
          </Typography>
          <Typography variant="body1" mt={2}>
            Here are <b>{proposal.choices.length} potential solutions</b> in
            this proposal to answer the question. You have{' '}
            <b>{userVotingPower} votes</b> to distribute among these options.
            Your votes will determine which solution is the best potential
            answer to the value topic.
          </Typography>
          <Typography variant="body1" mt={5}>
            You are assigned to <b>{proposalTypeReadable}</b> voting system.
          </Typography>
          <Typography variant="body1" mt={2}>
            {proposal.type === 'quadratic'
              ? 'In quadratic voting, each choice will earn the square root of given votes. For example, if you give 100 votes to Option 1 and 25 votes to Option 2, Option 1 will earn sqrt(100) = 10 votes and Option 2 will earn sqrt(25) = 5 votes.'
              : 'In ranked voting, you will rank each option by giving more votes to choices you prefer. For example, you can give 100 votes to Option 1 (rank 1) and 25 votes to Option 2 (rank 2).'}
          </Typography>
          <Typography variant="subtitle1" align="center" color="#777" mt={2}>
            (Click X or outside of this modal to return)
          </Typography>
          <Button
            onClick={() => setIsVotingPurposeModalOpen(false)}
            aria-label="Close modal"
            sx={{ position: 'absolute', top: 15, right: 15 }}
          >
            <CloseIcon />
          </Button>
        </ModalInnerBox>
      </Modal>
      {/* Info on voting system */}
      <Modal
        open={isVotingSystemModalOpen}
        onClose={() => setIsVotingSystemModalOpen(false)}
        sx={{ p: 3 }}
      >
        <ModalInnerBox>
          <Typography variant="body1" fontWeight="bold" textAlign="center">
            {proposalTypeReadable}&nbsp;Voting System
          </Typography>
          {proposal.type === 'quadratic' ? (
            <Typography variant="body1" mt={2}>
              <b>Quadratic Voting</b> is a voting system that gives more weight
              to small amount of votes. Voters are given a set of votes to
              distribute among the options. Each vote costs the square root of
              the number of votes given to an option. For example, if you give
              100 votes to Option 1 and 25 votes to Option 2, Option 1 will earn
              sqrt(100) = 10 votes and Option 2 will earn sqrt(25) = 5 votes.
            </Typography>
          ) : (
            <Typography variant="body1" mt={2}>
              <b>Ranked Voting</b> is a voting system that allows voters to rank
              each option by giving more votes to choices they prefer. For
              example, you can give 100 votes to Option 1 (rank 1) and 25 votes
              to Option 2 (rank 2).
            </Typography>
          )}
          <Typography variant="subtitle1" mt={2} align="center" color="#777">
            (Click X or outside of this modal to return)
          </Typography>
          <Button
            onClick={() => setIsVotingSystemModalOpen(false)}
            aria-label="Close modal"
            sx={{ position: 'absolute', top: 15, right: 15 }}
          >
            <CloseIcon />
          </Button>
        </ModalInnerBox>
      </Modal>
      {/* Post-voting Survey */}
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
          borderRadius={3}
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
