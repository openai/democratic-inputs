import { Box, Button, Stack, Typography } from '@mui/material'
import { useCallback, useState } from 'react'

import { LoadingScreen } from '@/components'
import { useWeb3Auth } from '@/hooks'
import {
  useCreateProposalsMutation,
  useMintTokensMutation,
} from '@/services/admin'

export default function ControlPanelPage() {
  const web3Auth = useWeb3Auth()

  const [createProposals, createProposalsRes] = useCreateProposalsMutation()
  const [mintTokens, mintTokensRes] = useMintTokensMutation()

  const [isCreatingProposals, setIsCreatingProposals] = useState(false)
  const [isMintingTokens, setIsMintingTokens] = useState(false)

  const createProposalHandler = useCallback(async () => {
    if (!web3Auth || !web3Auth.user) return
    setIsCreatingProposals(true)

    try {
      await createProposals({ appPubkey: web3Auth.user.appPubkey || '' })
    } catch (err) {
      console.log(err)
    } finally {
      setIsCreatingProposals(false)
    }
  }, [web3Auth, createProposals])

  const mintTokensHandler = useCallback(async () => {
    if (!web3Auth || !web3Auth.user) return
    setIsMintingTokens(true)

    try {
      await mintTokens({ appPubkey: web3Auth.user.appPubkey || '' })
    } catch (err) {
      console.log(err)
    } finally {
      setIsMintingTokens(false)
    }
  }, [web3Auth, mintTokens])

  if (
    !web3Auth ||
    !web3Auth.isReady ||
    (web3Auth.isReady && !web3Auth.isAuthenticated) ||
    !web3Auth.user ||
    (web3Auth.user.email !== 'jwp6@illinois.edu' &&
      web3Auth.user.email !== 'tsharma6@illinois.edu')
  ) {
    console.log('loading controlpanel')
    return <LoadingScreen />
  }

  return (
    <Stack direction="column" spacing={4} alignItems="center">
      <Box width="100%" maxWidth={450}>
        <Typography variant="h6" color="error.main" mb={1}>
          Minting takes a while for many users. Please be patient!
        </Typography>
        <Button
          variant="contained"
          color="success"
          onClick={mintTokensHandler}
          disabled={
            isMintingTokens ||
            mintTokensRes.isLoading ||
            mintTokensRes.isSuccess ||
            mintTokensRes.isError
          }
          fullWidth
        >
          {mintTokensRes.isLoading
            ? 'Minting...'
            : mintTokensRes.isSuccess
            ? 'Minted!'
            : 'Mint Tokens'}
        </Button>
        {mintTokensRes.isSuccess && (
          <Typography variant="body1" color="success.main">
            Mint completed! Wait for 10 seconds before creating proposals.
          </Typography>
        )}
      </Box>
      <Box width="100%" maxWidth={450}>
        <Typography variant="h6" color="error.main" mb={1}>
          Make sure to only click this button once! Click AFTER the minting
          tokens is complete.
        </Typography>
        <Button
          variant="contained"
          color="info"
          onClick={createProposalHandler}
          disabled={
            isCreatingProposals ||
            createProposalsRes.isLoading ||
            createProposalsRes.isSuccess ||
            createProposalsRes.isError
          }
          fullWidth
        >
          {createProposalsRes.isLoading
            ? 'Creating...'
            : createProposalsRes.isSuccess
            ? 'Created!'
            : 'Create Proposals'}
        </Button>
        {createProposalsRes.isSuccess && (
          <Typography variant="body1" color="success.main">
            Proposal created!
          </Typography>
        )}
      </Box>
    </Stack>
  )
}
