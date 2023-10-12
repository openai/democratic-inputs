import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

import type { RootState, AppDispatch } from '@/store'

export * from './useSnapshotProposalData'
export * from './useSocket'
export * from './useWeb3Auth'

// Typed version of `useDispatch` and `useSelector` for app
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
