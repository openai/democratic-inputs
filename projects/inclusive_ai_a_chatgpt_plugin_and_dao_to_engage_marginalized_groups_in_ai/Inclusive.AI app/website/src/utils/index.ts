import * as crypto from 'crypto'

export * from './misc'
export * from './snapshot'
export * from './web3auth'

import { Web3AuthProviderData, Web3AuthStatus } from '@/components/Providers'
import { ProposalUserVotes } from '@/components'

export const sha256 = (msg: string) =>
  crypto.createHash('sha256').update(msg).digest('hex')

export const isWeb3AuthLoadingOrErrored = (web3Auth: Web3AuthProviderData) => {
  let loading =
    web3Auth.status === Web3AuthStatus.UNINITIATED ||
    web3Auth.status === Web3AuthStatus.CONNECTING
  loading = loading || web3Auth.isLoading || web3Auth.isFetching

  let errored = web3Auth.status === Web3AuthStatus.ERRORED
  errored = errored || web3Auth.isError || !web3Auth.user || !web3Auth.provider
  errored = !loading && errored // Only show error if not loading

  return { loading, errored }
}

export const calculateTotalVotesByUser = (userVotes: ProposalUserVotes) => {
  return Object.values(userVotes).reduce((total, vote) => total + vote, 0)
}

export const getUserVoteChoice = (
  userVotes: ProposalUserVotes,
  choiceIdx: number,
) => {
  // note: choice is 1-indexed (already converted from 0-indexed as parameter)
  return userVotes[choiceIdx] || 0
}
