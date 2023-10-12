import {
  CHAIN_NAMESPACES,
  CustomChainConfig,
  WALLET_ADAPTER_TYPE,
  WALLET_ADAPTERS,
} from '@web3auth/base'
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider'
import { Web3AuthOptions } from '@web3auth/modal'
import { OpenloginAdapterOptions } from '@web3auth/openlogin-adapter'
import { ModalConfig } from '@web3auth/modal/src/interface'

const target = process.env.NEXT_PUBLIC_WEB3AUTH_TARGET as 'mainnet' | 'testnet'

//
// NOTE: To use compressed NFT and query using Read API, we need to use
//       RPC providers that support Read API. Here, we use
//       Helius (others include Triton and SimpleHash).
//
const OPTIMISM_CHAIN_TARGET = {
  mainnet: {
    chainId: '0xA', // 10
    displayName: 'Optimism',
    rpcTarget: 'https://rpc.ankr.com/optimism', // process.env.NEXT_PUBLIC_OPTIMISM_RPC_MAINNET
    blockExplorer: 'https://optimistic.etherscan.io/',
  },
  // testnet: {
  //   chainId: '0x27d8', // 10200
  //   displayName: 'Gnosis Chiado Testnet',
  //   rpcTarget: process.env.NEXT_PUBLIC_GNOSIS_RPC_TESTNET as string,
  //   blockExplorer: 'https://gnosis-chiado.blockscout.com/',
  // },
}

const AUTH_SERVICE_CREDENTIALS =
  target === 'mainnet'
    ? {
        web3AuthVerifierId: process.env
          .NEXT_PUBLIC_WEB3AUTH_VERIFIER_ID_MAINNET as string,
        auth0ClientId: process.env
          .NEXT_PUBLIC_AUTH0_CLIENT_ID_MAINNET as string,
      }
    : {
        web3AuthVerifierId: process.env
          .NEXT_PUBLIC_WEB3AUTH_VERIFIER_ID_TESTNET as string,
        auth0ClientId: process.env
          .NEXT_PUBLIC_AUTH0_CLIENT_ID_TESTNET as string,
      }

export const web3AuthConfig: Web3AuthOptions = {
  clientId: AUTH_SERVICE_CREDENTIALS.web3AuthVerifierId,
  web3AuthNetwork: target === 'mainnet' ? 'cyan' : 'testnet',
  chainConfig: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    ticker: 'ETH',
    tickerName: 'Ether',
    // ...OPTIMISM_CHAIN_TARGET[target],
    ...OPTIMISM_CHAIN_TARGET.mainnet,
  },
  uiConfig: {
    loginMethodsOrder: ['google', 'email_passwordless'],
    // appLogo: 'https://cloudflare-ipfs.com/ipfs/',
  },
}

// eslint-disable-next-line import/no-mutable-exports
export const openloginAdapterConfig: OpenloginAdapterOptions = {
  // web3AuthNetwork: 'testnet',
  privateKeyProvider: new EthereumPrivateKeyProvider({
    config: { chainConfig: web3AuthConfig.chainConfig as CustomChainConfig },
  }),

  adapterSettings: {
    // network: 'testnet',
    loginConfig: {
      // ONLY: Google & passwordless (email)
      jwt: {
        verifier: AUTH_SERVICE_CREDENTIALS.web3AuthVerifierId, // "YOUR-VERIFIER-NAME-ON-WEB3AUTH-DASHBOARD",
        typeOfLogin: 'jwt',
        clientId: AUTH_SERVICE_CREDENTIALS.auth0ClientId, // "YOUR-AUTH0-CLIENT-ID-FROM-AUTH0-DASHBOARD",
      },
    },
    uxMode: 'redirect',
    whiteLabel: {
      name: 'Inclusive AI',
      // logoLight: 'https://cloudflare-ipfs.com/ipfs/',
      // logoDark: 'https://cloudflare-ipfs.com/ipfs/',
      defaultLanguage: 'en',
      dark: false,
    },
  },
  loginSettings: {
    mfaLevel: 'none',
  },
}

export const initModalConfig: {
  modalConfig: Record<WALLET_ADAPTER_TYPE, ModalConfig>
} = {
  modalConfig: {
    [WALLET_ADAPTERS.OPENLOGIN]: {
      label: 'openlogin',
      loginMethods: {
        google: {
          name: 'google login',
        },
        facebook: { name: 'facebook', showOnModal: false },
        twitter: { name: 'twitter', showOnModal: false },
        reddit: { name: 'reddit', showOnModal: false },
        discord: { name: 'discord', showOnModal: false },
        twitch: { name: 'twitch', showOnModal: false },
        apple: { name: 'apple', showOnModal: false },
        line: { name: 'line', showOnModal: false },
        github: { name: 'github', showOnModal: false },
        kakao: { name: 'kakao', showOnModal: false },
        linkedin: { name: 'linkedin', showOnModal: false },
        weibo: { name: 'weibo', showOnModal: false },
        wechat: { name: 'wechat', showOnModal: false },
        sms_passwordless: { name: 'sms', showOnModal: false },
        // email_passwordless: { name: 'email', showOnModal: false },
      },
      showOnModal: true,
    },
    //
    // only allow social login, disable all external wallet
    //
    [WALLET_ADAPTERS.TORUS_EVM]: {
      label: 'torus',
      showOnModal: false,
      showOnMobile: false,
      showOnDesktop: false,
    },
    [WALLET_ADAPTERS.METAMASK]: {
      label: 'metamask',
      showOnModal: false,
      showOnMobile: false,
      showOnDesktop: false,
    },
    [WALLET_ADAPTERS.WALLET_CONNECT_V2]: {
      label: 'walletconnect',
      showOnModal: false,
      showOnMobile: false,
      showOnDesktop: false,
    },
    [WALLET_ADAPTERS.WALLET_CONNECT_V1]: {
      label: 'walletconnect',
      showOnModal: false,
      showOnMobile: false,
      showOnDesktop: false,
    },
  },
}
