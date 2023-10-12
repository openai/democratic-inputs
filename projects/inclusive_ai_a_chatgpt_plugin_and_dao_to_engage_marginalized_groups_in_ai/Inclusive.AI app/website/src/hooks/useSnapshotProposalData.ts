import { useMemo, useState } from 'react'

import { getSnapshotProposal, getSnapshotProposalVotes } from '@/utils/snapshot'
import { SnapshotProposal, SnapshotProposalVote } from '@/types'

export function useSnapshotProposalData(proposalId: string | null | undefined) {
  const [isError, setIsError] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [proposal, setProposal] = useState<SnapshotProposal>()
  const [votes, setVotes] = useState<SnapshotProposalVote[]>()
  const [forceRefresh, setSnapshotForceRefetch] = useState(false)

  useMemo(async () => {
    if (!proposalId) return
    // console.log('proposalId', proposalId)
    setIsLoading(true)
    setIsError(false)

    if (forceRefresh) setSnapshotForceRefetch(false)

    try {
      const proposal = await getSnapshotProposal(proposalId)
      if (!proposal) return
      setProposal(proposal)

      // Fetch votes if proposal exists
      const votes = await getSnapshotProposalVotes(proposalId)
      setVotes(votes)
    } catch (err) {
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }, [proposalId, forceRefresh])

  return { proposal, votes, isLoading, isError, setSnapshotForceRefetch }
}
