export * from './ProposalOption'
export * from './ProposalQuadraticVote'
export * from './ProposalRankVote'

export interface ProposalGenericProps {
  choices: ProposalChoice[]
  userVp: number // user's vote power for this proposal
  userProposalVotes: ProposalUserVotes
  // proposalCastedVotes: number // total casted votes of proposal
  // proposalCastedScores: number // total casted score of proposal
  voteOnProposal: (userProposalVotes: ProposalUserVotes) => void
  isSubmittingVote: boolean
  isSubmittingError: boolean
  isSubmittingSuccess: boolean
}

export type ProposalUserVotes = Record<number, number>

// choice is 1-indexed
export type ProposalChoice = { choice: string; index: number }
