import { getPublicCompressed } from '@toruslabs/eccrypto'
import {
  ADAPTER_EVENTS,
  CONNECTED_EVENT_DATA,
  SafeEventEmitterProvider,
  UserInfo,
} from '@web3auth/base'
import { Web3Auth } from '@web3auth/modal'
import { OpenloginAdapter } from '@web3auth/openlogin-adapter'
// import { LOGIN_MODAL_EVENTS } from '@web3auth/ui'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import {
  initModalConfig,
  openloginAdapterConfig,
  web3AuthConfig,
} from '@/config/web3auth'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { useGetUserQuery } from '@/services/user'
import { setUserJwtToken } from '@/slices/app'
import { selectUserData } from '@/slices/user'
import { UserPod, UserProfile } from '@/types'

export enum Web3AuthStatus {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  ERRORED = 'ERRORED',
  UNINITIATED = 'UNINITIATED',
}

export type Web3AuthExtendedUser = Partial<UserInfo> & { appPubkey: string }

export type Web3AuthStatusExtended = Web3AuthStatus | 'NOT_READY'

export type Web3AuthProviderData = {
  isReady: boolean
  isAuthenticated: boolean
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  userPod: UserPod | undefined
  userProfile: UserProfile | undefined
  // normal web3auth stuff
  web3auth: Web3Auth | undefined
  provider: SafeEventEmitterProvider | undefined
  providerData: CONNECTED_EVENT_DATA | undefined
  user: Web3AuthExtendedUser | undefined
  status: Web3AuthStatusExtended | undefined
  onSuccessfulLogin: (
    web3auth: Web3Auth,
    data: CONNECTED_EVENT_DATA,
    user: any,
  ) => void
  login: () => void
  logout: () => void
}

export const Web3AuthProviderContext =
  React.createContext<Web3AuthProviderData>({
    isReady: false,
    isAuthenticated: false,
    isLoading: true,
    isFetching: true,
    isError: false,
    userPod: undefined,
    userProfile: undefined,
    // normal web3auth stuff
    web3auth: undefined,
    provider: undefined,
    providerData: undefined,
    user: undefined,
    status: Web3AuthStatus.UNINITIATED,
    onSuccessfulLogin: () => {},
    login: () => {},
    logout: () => {},
  })

export default function Web3AuthProvider({
  children,
}: React.PropsWithChildren) {
  const dispatch = useAppDispatch()
  const userData = useAppSelector(selectUserData)

  const [provider, setProvider] = useState<
    SafeEventEmitterProvider | undefined
  >(undefined)
  const [user, setUser] = useState<Web3AuthExtendedUser | undefined>(undefined)
  const [providerData, setProviderData] = useState<
    CONNECTED_EVENT_DATA | undefined
  >(undefined)
  const [web3auth, setWeb3Auth] = useState<Web3Auth | undefined>(undefined)
  const [status, setStatus] = useState<Web3AuthStatusExtended>(
    Web3AuthStatus.UNINITIATED,
  )
  // const [isReady, setIsReady] = useState(false)
  // const [isAuthenticated, setIsAuthenticated] = useState(false)

  const {
    data: fetchedUserData,
    // error: fetchErrorUserData,
    isLoading: isUserDataLoading,
    isFetching: isUserDataFetching,
    isError: isUserDataError,
  } = useGetUserQuery(user?.appPubkey || '', {
    skip: !user || !user.appPubkey,
    refetchOnMountOrArgChange: true,
  })

  const onSuccessfulLogin = useCallback(
    (
      web3auth: Web3Auth,
      data: CONNECTED_EVENT_DATA,
      user: Web3AuthExtendedUser,
    ) => {
      setProviderData(data)
      web3auth.connect().then(async (provider) => {
        setProvider(provider || undefined)
        // console.log(user)

        dispatch(setUserJwtToken(user.idToken || ''))

        // Grab app pubkey
        let pubkey = ''
        if (web3auth.provider) {
          const privKey: any = await web3auth.provider.request({
            method: 'eth_private_key',
          })
          pubkey = getPublicCompressed(
            Buffer.from(privKey.padStart(64, '0'), 'hex'),
          ).toString('hex')
        }

        setUser({
          ...user,
          appPubkey: pubkey, // without 0x prefix
        })
      })
    },
    [dispatch],
  )

  const login = useCallback(() => {
    // console.log(web3auth)
    if (!web3auth) return
    web3auth
      .connect()
      .then(() => {
        console.log('Login successful!')
        // console.log(data)
      })
      .catch((err) => {
        console.error('Login failed!')
        console.error(err)
      })
  }, [web3auth])

  const logout = useCallback(() => {
    if (!web3auth) return
    web3auth
      .logout()
      .then(() => {
        console.log('Logout successful!')
        dispatch(setUserJwtToken(''))
      })
      .catch((err) => {
        console.error('Logout failed!')
        console.error(err)
      })
  }, [dispatch, web3auth])

  //
  // Subscribe to Web3Auth auth events
  //
  const subscribeAuthEvents = useCallback(
    (web3auth: Web3Auth) => {
      console.log('web3auth status', web3auth.status)
      if (!web3auth) return

      if (web3auth.status == ADAPTER_EVENTS.NOT_READY) {
        setStatus('NOT_READY')
      }

      web3auth.on(ADAPTER_EVENTS.CONNECTED, (data: CONNECTED_EVENT_DATA) => {
        // console.log('Yeah!, you are successfully logged in', data)
        console.log('connected')
        setStatus(Web3AuthStatus.CONNECTED)

        // Call `onSuccessfulLogin` with the fetched user info on successful authentication
        web3auth
          .getUserInfo()
          .then((user) =>
            onSuccessfulLogin(web3auth, data, { ...user, appPubkey: '' }),
          )
      })

      web3auth.on(ADAPTER_EVENTS.CONNECTING, () => {
        console.log('connecting')
        setStatus(Web3AuthStatus.CONNECTING)
      })

      web3auth.on(ADAPTER_EVENTS.DISCONNECTED, () => {
        console.log('disconnected')
        setStatus(Web3AuthStatus.DISCONNECTED)
        setUser(undefined)
        setProvider(undefined)
        dispatch(setUserJwtToken(''))
      })

      web3auth.on(ADAPTER_EVENTS.ERRORED, (error) => {
        setStatus(Web3AuthStatus.ERRORED)
        console.log('some error or user have cancelled login request', error)
      })

      web3auth.on(ADAPTER_EVENTS.NOT_READY, () => {
        console.log('not ready')
      })

      web3auth.on(ADAPTER_EVENTS.READY, () => {
        // setStatus(Web3AuthStatus.)
        console.log('ready')
      })

      // web3auth.on(LOGIN_MODAL_EVENTS.MODAL_VISIBILITY, (isVisible) => {
      //   console.log('modal visibility', isVisible)
      // })
    },
    [dispatch, onSuccessfulLogin],
  )

  //
  // Initialize Web3Auth
  //
  useEffect(() => {
    // console.log(web3AuthConfig)
    if (!web3AuthConfig || !web3AuthConfig.clientId) return

    const newWeb3auth = new Web3Auth(web3AuthConfig)
    newWeb3auth.configureAdapter(new OpenloginAdapter(openloginAdapterConfig))

    // Overwrite to the newest Web3Auth data
    setWeb3Auth(newWeb3auth)
    subscribeAuthEvents(newWeb3auth)

    newWeb3auth.initModal(initModalConfig).catch((err) => {
      console.error(err)
    })
  }, [subscribeAuthEvents])

  //
  // Create Web3Auth context
  //
  const ctx: Web3AuthProviderData = useMemo(() => {
    const base = {
      web3auth,
      provider,
      providerData,
      user,
      status,
      onSuccessfulLogin,
      login,
      logout,
    }

    // console.log('isUserDataLoading', isUserDataLoading)
    // console.log('isUserDataFetching', isUserDataFetching)
    // console.log('isUserDataError', isUserDataError)

    // console.log('first', isUserDataLoading, isUserDataFetching)
    // console.log('second', user)
    // console.log('third', !isUserDataError)
    // console.log('fourth', !!fetchedUserData)

    if (
      !isUserDataLoading &&
      !isUserDataFetching &&
      status == Web3AuthStatus.CONNECTED
    ) {
      if (user && !isUserDataError && !!fetchedUserData) {
        return {
          ...base,
          userProfile: userData.profile,
          userPod: userData.pod,
          isLoading: false,
          isFetching: false,
          isError: false,
          isReady: true,
          isAuthenticated: true,
        }
      }
      return {
        ...base,
        userProfile: undefined,
        userPod: undefined,
        isLoading: false,
        isFetching: false,
        isError: true,
        isReady: true,
        isAuthenticated: user?.appPubkey ? true : false,
      }
    }

    return {
      ...base,
      userProfile: undefined,
      userPod: undefined,
      isLoading: true,
      isFetching: true,
      isError: false,
      isReady: false,
      isAuthenticated: false,
    }
  }, [
    login,
    logout,
    onSuccessfulLogin,
    provider,
    providerData,
    status,
    user,
    web3auth,
    userData,
    fetchedUserData,
    isUserDataLoading,
    isUserDataFetching,
    isUserDataError,
  ])

  return (
    <Web3AuthProviderContext.Provider value={ctx}>
      {children}
    </Web3AuthProviderContext.Provider>
  )
}

export const Web3AuthConsumer = Web3AuthProviderContext.Consumer
