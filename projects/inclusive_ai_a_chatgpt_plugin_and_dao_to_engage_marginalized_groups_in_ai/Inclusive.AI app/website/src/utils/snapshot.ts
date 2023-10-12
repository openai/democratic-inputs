import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import snapshot from '@snapshot-labs/snapshot.js'
import { ethers } from 'ethers'

import {
  SnapshotProposal,
  SnapshotProposalDetailed,
  SnapshotProposalVote,
  SnapshotProposalVoteDetailed,
  SnapshotUserVotes,
} from '@/types'

const apolloClient = new ApolloClient({
  uri: 'https://hub.snapshot.org/graphql',
  cache: new InMemoryCache(),
})

const snapshotHub = 'https://hub.snapshot.org' // testnet: https://testnet.snapshot.org

export const snapshotClient = new snapshot.Client712(snapshotHub)

export async function getUserVp(user: string, proposalId: string) {
  if (!ethers.isAddress(user)) return { vp: 0, vp_by_strategy: [] }

  const { data } = await apolloClient.query<{
    vp: { vp: number; vp_by_strategy: number[] }
  }>({
    query: gql`
      query VotingPower($user: String!, $proposal: String!) {
        vp(voter: $user, space: "inclusiveai.eth", proposal: $proposal) {
          vp
          vp_by_strategy
          vp_state
        }
      }
    `,
    variables: {
      user,
      proposal: proposalId,
    },
  })

  return data.vp
}

export async function getUserProposalVotes(user: string, proposalId: string) {
  if (!ethers.isAddress(user)) return [] as SnapshotUserVotes

  const { data } = await apolloClient.query<{ votes: SnapshotUserVotes }>({
    query: gql`
      query GetUserVotes($proposal: String!, $user: String!) {
        votes(where: { proposal: $proposal, voter: $user }) {
          id
          choice
          vp
          vp_by_strategy
        }
      }
    `,
    variables: {
      user,
      proposal: proposalId,
    },
  })

  // console.log('data', data)
  return data.votes
}

export async function getSnapshotProposal(
  proposalId: string,
): Promise<SnapshotProposal> {
  const { data } = await apolloClient.query<{ proposal: SnapshotProposal }>({
    query: gql`
      query Proposal($id: String!) {
        proposal(id: $id) {
          id
          title
          type
          symbol
          body
          choices
          created
          start
          end
          snapshot
          state
          author
          space {
            id
            name
          }
          votes
          quorum
          scores
          scores_state
          scores_total
          scores_updated
        }
      }
    `,
    variables: {
      id: proposalId,
    },
  })

  return data.proposal
}

export async function getSnapshotProposalDetailed(
  proposalId: string,
): Promise<SnapshotProposalDetailed> {
  const { data } = await apolloClient.query<{
    proposal: SnapshotProposalDetailed
  }>({
    query: gql`
      query Proposal($id: String!) {
        proposal(id: $id) {
          id
          title
          type
          symbol
          body
          choices
          created
          start
          end
          snapshot
          state
          author
          space {
            id
            name
          }
          votes
          quorum
          scores
          scores_state
          scores_total
          scores_updated

          ipfs
          network
          plugins
          privacy
          discussion
          validation {
            name
            params
          }
          strategies {
            name
            network
            params
          }
          scores_by_strategy
          flagged
        }
      }
    `,
    variables: {
      id: proposalId,
    },
  })

  return data.proposal
}

export async function getSnapshotProposalVotes(
  proposalId: string,
): Promise<SnapshotProposalVote[]> {
  const { data } = await apolloClient.query<{
    votes: SnapshotProposalVote[]
  }>({
    query: gql`
      query Votes($id: String!) {
        votes(where: { proposal: $id }, orderBy: "vp", orderDirection: desc) {
          id
          voter
          created
          choice
          vp
          vp_state
        }
      }
    `,
    variables: {
      id: proposalId,
    },
  })
  return data.votes
}

export async function getSnapshotProposalVotesDetailed(
  proposalId: string,
): Promise<SnapshotProposalVoteDetailed[]> {
  const { data } = await apolloClient.query<{
    votes: SnapshotProposalVoteDetailed[]
  }>({
    query: gql`
      query Votes($id: String!) {
        votes(where: { proposal: $id }, orderBy: "vp", orderDirection: desc) {
          id
          voter
          created
          choice
          vp
          vp_state

          reason
          vp_by_strategy
        }
      }
    `,
    variables: {
      id: proposalId,
    },
  })
  return data.votes
}
