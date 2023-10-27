import { getBaseEnergizeEngineUrl } from "./energize-engine"
import { useAuth } from "@clerk/clerk-react"

type StreamDataOptions = {
  body: Record<string, any>
  apiUrl: string
  onDone?: () => void
  onMessage?: (m: string) => void
  onError?: (m: string) => void
  onFinally?: () => void
}

export default function useStreamTextDataFromApi() {
  const { getToken } = useAuth()

  const authenticatedFetch = async (options: StreamDataOptions) => {
    try {
      const response = await fetch(`${getBaseEnergizeEngineUrl()}${options.apiUrl}`, {
        method: "POST",
        body: JSON.stringify(options.body),
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "X-Api-Key": process.env.NEXT_PUBLIC_ENERGIZE_ENGINE_KEY ?? "",
        },
      })

      if (!response.ok) {
        throw new Error("Something went wrong")
      }

      let final = ""

      options.onMessage?.(final)

      // read in the stream
      const reader = response.body?.getReader()
      if (!reader) return

      while (true) {
        const { value, done } = await reader.read()

        if (value !== undefined) {
          const parsed = new TextDecoder("utf-8").decode(value)
          final += parsed

          options.onMessage?.(final)
        }

        if (done) {
          options.onDone?.()

          if (final === "") {
            options.onError?.("No data was returned. Might have been due to content moderation.")
            if (options.body.userMessage) {
              options.onMessage?.(options.body.userMessage)
            }
          }

          return
        }
      }
    } catch (e: any) {
      options.onError?.(e.message)
    } finally {
      options.onFinally?.()
    }
  }

  return authenticatedFetch
}
