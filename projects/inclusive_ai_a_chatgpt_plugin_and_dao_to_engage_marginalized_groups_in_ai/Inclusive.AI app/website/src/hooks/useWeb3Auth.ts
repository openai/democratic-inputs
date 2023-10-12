import { useContext } from 'react'

import {
  Web3AuthProviderContext,
  Web3AuthProviderData,
} from '@/components/Providers/Web3AuthProvider'

export const useWeb3Auth = () =>
  useContext<Web3AuthProviderData>(Web3AuthProviderContext)
