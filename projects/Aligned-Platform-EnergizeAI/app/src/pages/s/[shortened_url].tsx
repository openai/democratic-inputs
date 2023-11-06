import { LogInIcon } from "lucide-react"

import { Redirect } from "@/components/redirect"
import { Button } from "@/components/ui/button"
import QueryDataLoader from "@/components/ui/query-data-loader"
import { Spinner } from "@/components/ui/spinner"
import { energizeEngine } from "@/lib/energize-engine"
import { SignInButton, useAuth } from "@clerk/clerk-react"
import { usePathname } from "next/navigation"
import { useRouter } from "next/router"

export default function ShortenedUrlPage() {
  const { userId } = useAuth()
  const { shortened_url } = useRouter().query
  const pathname = usePathname()

  const shortenedUrlQuery = energizeEngine.shortenedUrls.getOriginalUrl.useQuery(
    {
      shortUrl: shortened_url as string,
    },
    {
      enabled: Boolean(shortened_url),
      retry: false,
    },
  )

  if (!userId) {
    return (
      <div className="mt-20 flex h-full w-full flex-col items-center justify-center gap-8">
        <h1 className="flex items-center gap-4">
          <img src="/logo.png" alt="Logo" className="h-9 text-primary-foreground" />
          Redirecting, but you please log in first...
        </h1>
        <SignInButton mode="redirect" redirectUrl={pathname}>
          <Button variant="outline" id="login-button">
            Log in
            <LogInIcon className="ml-2 h-4 w-4" />
          </Button>
        </SignInButton>
      </div>
    )
  }

  function getStringAfterOrigin(urlString: string): string {
    try {
      const url = new URL(urlString)
      return urlString.substring(url.origin.length)
    } catch (e) {
      console.error("Invalid URL:", e)
      return ""
    }
  }

  const pathFromUrl = shortenedUrlQuery.data ? getStringAfterOrigin(shortenedUrlQuery.data) : ""

  return (
    <QueryDataLoader queryResults={shortenedUrlQuery} skeletonItems={1}>
      <QueryDataLoader.IsLoading>
        <div className="mt-10 flex h-full w-full items-center justify-center gap-4">
          Redirecting...
          <Spinner />
        </div>
      </QueryDataLoader.IsLoading>
      <QueryDataLoader.IsSuccess>
        <Redirect redirectTo={pathFromUrl} />
      </QueryDataLoader.IsSuccess>
      <QueryDataLoader.IsError>
        <Redirect redirectTo="/404" />
      </QueryDataLoader.IsError>
    </QueryDataLoader>
  )
}
