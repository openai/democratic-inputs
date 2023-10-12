import { ADAPTER_EVENTS, CONNECTED_EVENT_DATA, UserInfo } from '@web3auth/base'
import { Web3Auth } from '@web3auth/modal'
import { LOGIN_MODAL_EVENTS } from '@web3auth/ui'

// subscribe to lifecycle events emitted by web3auth
export interface SubscribeAuthEvents {
  web3auth: Web3Auth
  setUser: React.Dispatch<React.SetStateAction<Partial<UserInfo> | undefined>>
  setProvider: (provider: any) => void
  onSuccessfulLogin: (
    data: CONNECTED_EVENT_DATA,
    user: Partial<UserInfo>,
  ) => void
}

// const subscribeAuthEvents = useCallback(
//   (newWeb3auth) =>
//     subscribeAuthEventsImpl({
//       web3auth: newWeb3auth,
//       setUser,
//       setProvider,
//       onSuccessfulLogin,
//     }),
//   [onSuccessfulLogin],
// )

export function subscribeAuthEvents(p: SubscribeAuthEvents) {
  if (!p.web3auth) return

  p.web3auth.on(ADAPTER_EVENTS.CONNECTED, (data: CONNECTED_EVENT_DATA) => {
    console.log('Yeah!, you are successfully logged in', data)
    p.web3auth.getUserInfo().then((user) => {
      p.onSuccessfulLogin(data, user)
    })
  })

  p.web3auth.on(ADAPTER_EVENTS.CONNECTING, () => {
    console.log('connecting')
  })

  p.web3auth.on(ADAPTER_EVENTS.DISCONNECTED, () => {
    console.log('disconnected')
    p.setUser(undefined)
    p.setProvider(undefined)
  })

  p.web3auth.on(ADAPTER_EVENTS.ERRORED, (error) => {
    console.log('some error or user have cancelled login request', error)
  })

  p.web3auth.on(LOGIN_MODAL_EVENTS.MODAL_VISIBILITY, (isVisible) => {
    console.log('modal visibility', isVisible)
  })

  return () => {
    p.web3auth.removeAllListeners()
  }
}
