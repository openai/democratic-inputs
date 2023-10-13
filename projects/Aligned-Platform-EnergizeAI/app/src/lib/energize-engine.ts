import { transformer } from "@/lib/transformer"
import { EnergizeEngineRouter } from "@energizeai/engine"
import { QueryCache } from "@tanstack/react-query"
import { httpBatchLink } from "@trpc/client"
import { loggerLink } from "@trpc/client/links/loggerLink"
import { createTRPCNext } from "@trpc/next"

export function getBaseEnergizeEngineUrl() {
  // reference for vercel.com
  const publicUrl = process.env.NEXT_PUBLIC_ENERGIZE_ENGINE
  const privateUrl = process.env.ENERGIZE_ENGINE

  if (publicUrl && publicUrl !== `""`) {
    return `https://${process.env.NEXT_PUBLIC_ENERGIZE_ENGINE}`
  } else if (privateUrl && privateUrl !== `""`) {
    return `https://${process.env.ENERGIZE_ENGINE}`
  }

  // assume localhost
  return `http://127.0.0.1:4000`
}

export function getSessionToken(): string | null {
  // get the __session cookie
  return (
    window.document.cookie
      .split("; ")
      .find((row) => row.startsWith("__session="))
      ?.split("=")[1] ?? null
  )
}

export const energizeEngine = createTRPCNext<EnergizeEngineRouter>({
  config(opts) {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    return {
      /**
       * @link https://trpc.io/docs/data-transformers
       */
      transformer,
      /**
       * @link https://trpc.io/docs/links
       */
      links: [
        // adds pretty logs to your console in development and logs errors in production
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" || (opts.direction === "down" && opts.result instanceof Error),
        }),
        httpBatchLink({
          maxURLLength: 2083,
          url: `${getBaseEnergizeEngineUrl()}/api/trpc`,
          /**
           * Set custom request headers on every request from tRPC
           * @link https://trpc.io/docs/ssr
           */
          headers() {
            const headers = opts.ctx?.req?.headers ?? {}

            const token = getSessionToken()

            if (token) {
              headers.Authorization = `Bearer ${token}`
            }

            if (process.env.NEXT_PUBLIC_ENERGIZE_ENGINE_KEY) {
              headers["X-Api-Key"] = process.env.NEXT_PUBLIC_ENERGIZE_ENGINE_KEY
            }

            return headers
          },
        }),
      ],
      /**
       * @link https://tanstack.com/query/v4/docs/react/reference/QueryClient
       */
      queryClientConfig: {
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: true,
          },
        },
        queryCache: new QueryCache({
          onError: (error) => {
            console.error("Error happened: ", error)
          },
        }),
      },
    }
  },
  ssr: false,
})
