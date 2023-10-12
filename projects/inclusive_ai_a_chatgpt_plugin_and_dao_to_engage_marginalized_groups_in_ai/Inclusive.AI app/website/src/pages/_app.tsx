import { ThemeProvider } from '@mui/material/styles'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import React, { useEffect } from 'react'
import TagManager from 'react-gtm-module'
import { Provider as StoreProvider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import '@/styles/global.css'

import { Web3AuthProvider } from '@/components/Providers'
import { Web3AuthGatedLayout } from '@/layouts'
import store, { persistor } from '@/store'
import customTheme from '@/theme'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_NODE_ENV === 'production') {
      TagManager.initialize({ gtmId: 'GTM-5MM433HR' })
    }
  }, [])

  return (
    <>
      <Head>
        {/* viewport can't be in _document.tsx, per https://nextjs.org/docs/messages/no-document-viewport-meta */}
        {/* <meta name="viewport" content="viewport-fit=cover" /> */}
        <meta
          name="viewport"
          content="width=device-width, height=device-height, initial-scale=1.0, minimum-scale=1.0"
        />
      </Head>
      <StoreProvider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider theme={customTheme}>
            <Web3AuthProvider>
              <Web3AuthGatedLayout>
                <Component {...pageProps} />
              </Web3AuthGatedLayout>
            </Web3AuthProvider>
          </ThemeProvider>
        </PersistGate>
      </StoreProvider>
    </>
  )
}
