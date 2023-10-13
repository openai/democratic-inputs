import { useEffect } from "react"

import { ClientAuthorization } from "@/components/client-authorization"
import { Layout } from "@/components/layout"
import { LoadingPage } from "@/components/ui/loading-page"
import { ThemeProvider } from "@/components/ui/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { energizeEngine } from "@/lib/energize-engine"
import "@/styles/globals.css"
import ProgressBar from "@badrap/bar-of-progress"
import { ClerkLoaded, ClerkLoading, ClerkProvider } from "@clerk/clerk-react"
import { dark } from "@clerk/themes"
import type { AppProps, AppType } from "next/app"
import { useRouter } from "next/router"

const progress = new ProgressBar({
  size: 4,
  color: "#0ea5e9",
  className: "bar-of-progress",
  delay: 100,
})

const MyApp: AppType = ({ Component, pageProps }: AppProps) => {
  const router = useRouter()

  useEffect(() => {
    const handleStart = () => {
      progress.start()
    }

    const handleStop = () => {
      progress.finish()
    }

    router.events.on("routeChangeStart", handleStart)
    router.events.on("routeChangeComplete", handleStop)
    router.events.on("routeChangeError", handleStop)

    return () => {
      router.events.off("routeChangeStart", handleStart)
      router.events.off("routeChangeComplete", handleStop)
      router.events.off("routeChangeError", handleStop)
    }
  }, [router])

  const clerk_pub_key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  if (!clerk_pub_key) {
    throw new Error("Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY")
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ClerkProvider
        publishableKey={clerk_pub_key}
        appearance={{
          baseTheme: dark,
        }}
      >
        <ClerkLoading>
          <LoadingPage />
        </ClerkLoading>
        <ClerkLoaded>
          <Toaster />
          <ClientAuthorization>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </ClientAuthorization>
        </ClerkLoaded>
      </ClerkProvider>
    </ThemeProvider>
  )
}

export default energizeEngine.withTRPC(MyApp)
