import { useMemo, useState } from 'react'

import { getUserProposalVotes } from '@/utils/snapshot'
import { SnapshotUserVotes } from '@/types'

interface UseSnapshotUserVotes {
  proposalId: string | undefined
  userAddress: string | undefined
}

export function useSnapshotUserVotes({
  proposalId,
  userAddress,
}: UseSnapshotUserVotes) {
  // const { data, loading, error } = useQuery<UserSnapshotVotesData>(
  //   GET_USER_VOTES,
  //   {
  //     variables: { proposalId, userId: userAddress },
  //   },
  // )

  const [isError, setIsError] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [votes, setVotes] = useState<SnapshotUserVotes>()
  const [forceRefresh, setUserVotesForceRefetch] = useState(false)

  useMemo(async () => {
    if (!proposalId || !userAddress) return
    setIsLoading(true)
    setIsError(false)

    if (forceRefresh) setUserVotesForceRefetch(false)

    try {
      const votes = await getUserProposalVotes(userAddress, proposalId)
      console.log('votes', votes)
      setVotes(votes)
    } catch (err) {
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }, [proposalId, userAddress, forceRefresh])

  return { userVotes: votes, isLoading, isError, setUserVotesForceRefetch }
}
