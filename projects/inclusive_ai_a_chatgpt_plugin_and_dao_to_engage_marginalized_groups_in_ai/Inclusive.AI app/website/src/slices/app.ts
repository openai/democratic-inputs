import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

// import {
//   Web3AuthStatus,
//   type CacheableWeb3AuthProviderData,
// } from '@/components/Providers'
import type { RootState } from '@/store'

export interface AppState {
  // web3AuthCache: CacheableWeb3AuthProviderData
  user: {
    jwtToken: string
  }
  watchedIntro: boolean
  hasVoted: boolean
  completedVotingIntro: boolean
}

const initialState: AppState = {
  // web3AuthCache: {
  //   provider: undefined,
  //   user: undefined,
  // },
  user: {
    jwtToken: '',
  },
  watchedIntro: false,
  hasVoted: false,
  completedVotingIntro: false,
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // setWeb3AuthCache: (
    //   state,
    //   action: PayloadAction<CacheableWeb3AuthProviderData>,
    // ) => {
    //   state.web3AuthCache = action.payload
    // },
    // unsetWeb3AuthCache: (state) => {
    //   state.web3AuthCache = initialState.web3AuthCache
    // },
    setUserJwtToken: (state, action: PayloadAction<string>) => {
      state.user.jwtToken = action.payload
    },
    setWatchedIntro: (state, action: PayloadAction<boolean>) => {
      state.watchedIntro = action.payload
    },
    setHasVoted: (state, action: PayloadAction<boolean>) => {
      state.hasVoted = action.payload
    },
    setCompletedVotingIntro: (state, action: PayloadAction<boolean>) => {
      state.completedVotingIntro = action.payload
    },
  },
})

// export const { setWeb3AuthCache, unsetWeb3AuthCache } = appSlice.actions
export const {
  setUserJwtToken,
  setWatchedIntro,
  setHasVoted,
  setCompletedVotingIntro,
} = appSlice.actions

// export const selectWeb3AuthCache = (state: RootState) => state.app.web3AuthCache
export const selectUserJwtToken = (state: RootState) => state.app.user.jwtToken
export const selectWatchedIntro = (state: RootState) => state.app.watchedIntro
export const selectHasVoted = (state: RootState) => state.app.hasVoted
export const selectCompletedVotingIntro = (state: RootState) =>
  state.app.completedVotingIntro

export default appSlice.reducer
