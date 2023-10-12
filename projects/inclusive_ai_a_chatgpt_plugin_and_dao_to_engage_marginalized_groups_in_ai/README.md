# Inclusive.AI: A ChatGPT Plugin and DAO to Engage Marginalized Groups in AI

In this project, a ChatGPT plugin will be developed that enables DAO (Decentralized Autonomous Organization) mechanisms to promote a ChatGPT-facilitated democratic decision process. This decentralized decision process will allow diverse marginalized populations, such as teenagers, people with disabilities, people of color, and people from the Global South, equal access to major decision makings and produce better decisions for communities and society at large.
![Screenshot 2023-09-20 at 12.13.55 PM.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/9db40024-cdfd-4993-8bc3-617750f19cbb/28b0da3d-2a82-43b4-aba6-b2b36089d53d/Screenshot_2023-09-20_at_12.13.55_PM.png)

![InclusiveAI.drawio.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/9db40024-cdfd-4993-8bc3-617750f19cbb/4965e9bc-767f-4843-9de6-c423d9cab1a9/InclusiveAI.drawio.png)
![Screenshot 2023-09-25 at 2.44.47 PM.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/9db40024-cdfd-4993-8bc3-617750f19cbb/4cb0bfe8-1897-4add-be97-4d5fcebd2b4e/Screenshot_2023-09-25_at_2.44.47_PM.png)

## Component: Web3Auth

We use [Web3Auth](https://web3auth.io/) (third-party) to enable simple signups & sign-ins via email, while also generating a unique MPC wallet for each user. This MPC wallet is later used to sign user’s votes for Snapshot proposals, discussed more below.

Using Web3Auth’s provided features, we can:

- Derive user’s blockchain address
- Enable users to sign authentic vote messages (proves the user has voted)
- Communicate with the server for user authentication using the provided `idToken` JWT

## Page: Sign Up / Sign In

First-time user signs up with email SSO via Web3Auth. Web3Auth returns a payload that contains the user’s email address and `appPubkey`, a unique public key assigned by Web3Auth for the user for this app.

When the user signs up, the user’s email address, appPubkey, and derived blockchain address are sent to the server for storage on database.

Every time the user signs in, `idToken` (provided by Web3Auth) is stored in the browser. Every request to the server that requires authentication attaches the token in the headers.

## Page: Profile Setup

When user signs up, she is directed to the “Intro” page where she needs to fill out a Typeform-like profile survey to fill in her personal information (we use “Quillforms”). When she completes the form and clicks “Submit,” the profile data is sent to the server for storage.

The profile setup happens only once after the user signs up. Once the user submits the profile data, the profile setup page is bypassed for subsequent sign-ins.

## Page: AI Chat

There are two main actions on the AI chat page:

1. Chat with AI, powered by GPT
2. Take a survey (which is a pre-requisite for voting on value topic)

# Voting

We use [Snapshot](https://docs.snapshot.org/) to facilitate a transparent voting system.

### How does Snapshot work?

Three key elements are involved in the voting process: **spaces**, **proposals** and **votes**. We created a space for each pod containing a proposal representing the respective pod’s value question.

A space contains a “validation strategy” that specifies who can vote. In our case, our validation is set to owners of vote tokens, discussed below. When a proposal is created in a space, the validation strategy takes a snapshot of the vote token balances at the block number at the creation time. **In other words, a proposal only considers users' voting power at and before it was created.**

## Voting Tokens on Optimism

We created two VoteToken smart contracts, *INCLQ* and *INCLR*, on Optimism that represents the voting power of users. When users are given voting tokens, we call the “mint” function on these smart contracts to increase each user’s balance (thus the voting power). After we give all voting tokens to the users, we then create a proposal to reflect the voting power of all users. 
****

Why do we create the proposal only after every register? **This is a limitation of Snapshot**

⇒ When DAOs create proposals, some malicious actors might purchase tokens to sway the votes. For example, a proposal might determine “Who will receive this grant” and a malicious entity can vote to get the grant themselves. Snapshot prevents this malicious behavior by enforcing that all eligible voters are token (vote) holders previous to the proposal creation.

Some users are given more tokens than others in the “early” pods, discussed below.

## Why Optimism?

We picked Optimism for two main reasons:

1. Cheap gas fee, reliable network with EVM compatibility.
2. Potential integration with Worldcoin’s Sign-In feature

For (1), cheap gas and EVM compatibility is found in other EVM L2s (rollups) as well. However, with Optimism’s stable uptime and reason (2), we picked it as the rollup to deploy these vote token contracts.

For (2), early on we explored various third-party sign-in libraries that satisfies three criteria:

1. Simple Web2 sign-ins (Email, SSO, etc.)
2. Generates blockchain address tied to the email (non-custodial)
3. Sybil-resistant

We found three solutions that satisfy two of the three criteria:

- [Web3Auth](https://web3auth.io)
- [Privy](https://privy.io)
- [Sign In with Worldcoin](https://docs.worldcoin.org/id/sign-in)

  
