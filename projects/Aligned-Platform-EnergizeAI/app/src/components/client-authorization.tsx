import { pathToRegexp } from "path-to-regexp"
import { ReactNode } from "react"

import { Redirect } from "./redirect"
import { LoadingPage } from "./ui/loading-page"
import { WaitlistForm } from "./waitlist/waitlist-form"
import { energizeEngine } from "@/lib/energize-engine"
import { PERMISSIONS_MAP, Paths, PublicRoutes } from "@/lib/paths"
import { Error404 } from "@/pages/404"
import { useUser } from "@clerk/clerk-react"
import { usePathname } from "next/navigation"
import { useRouter } from "next/router"

type Props = {
  children: ReactNode
}

export const ClientAuthorization = ({ children }: Props) => {
  const pathname = usePathname()
  const { space_id } = useRouter().query

  const success = <>{children}</>

  const loading = <LoadingPage />

  const error = (msg?: string) => <Error404 error_message={msg} />

  const { user } = useUser()

  const matchingPath = (Object.keys(PERMISSIONS_MAP) as Paths[]).find((path) => {
    const re = pathToRegexp(path)
    const match = re.exec(pathname)

    if (!match) {
      return false
    }

    return true
  })

  const isPublic = matchingPath && PublicRoutes.includes(matchingPath)
  const enableOrg = !!space_id && !isPublic

  const isEmailWaitlistApproved = energizeEngine.waitlists.isEmailWaitlistApproved.useQuery(
    {
      email: user ? user.emailAddresses[0].emailAddress : null,
      spaceId: space_id as string,
    },
    {
      retry: false,
      enabled: !!user && !isPublic && enableOrg,
      refetchOnWindowFocus: false,
    },
  )

  const foundOrg = energizeEngine.spaces.getSpaceById.useQuery(
    {
      spaceId: space_id as string,
    },
    {
      enabled: enableOrg,
      retry: false,
      retryOnMount: false,
      refetchOnWindowFocus: false,
    },
  )

  const enableUser = !!space_id && !!user && !isPublic
  const userRole = energizeEngine.roles.getRoleInSpace.useQuery(
    {
      spaceId: space_id as string,
    },
    {
      enabled: enableUser,
      retry: false,
      retryOnMount: false,
      refetchOnWindowFocus: false,
    },
  )

  // no matching path: 404
  if (!matchingPath) {
    return error(
      process.env.NODE_ENV === "development"
        ? `[DEV ONLY] No matching path for ${pathname}. To fix: add it in lib/paths.`
        : undefined,
    )
  }

  // public route: good to go
  if (isPublic) {
    return success
  } else if (!user) {
    // not logged in: redirect to login
    // note: this should never happen because middleware should redirect to home
    return <Redirect redirectTo={"/"} />
  }

  const allowedRoles = PERMISSIONS_MAP[matchingPath].allowedRoles

  if (
    (enableOrg && isEmailWaitlistApproved.isLoading) ||
    (enableOrg && foundOrg.isLoading) ||
    (enableUser && userRole.isLoading)
  ) {
    return loading
  }

  // org not found: 404
  if (space_id && !foundOrg.data) {
    return error(process.env.NODE_ENV === "development" ? `[DEV ONLY] Space ID (${space_id}) not found.` : undefined)
  }

  // not waitlist approved: show error
  if (!isEmailWaitlistApproved.data && space_id) {
    return <WaitlistForm spaceId={space_id as string} />
  }

  if (allowedRoles.length === 0) {
    return success
  }

  if (userRole.data) {
    const ix = (allowedRoles as string[]).indexOf(userRole.data.name)

    if (ix === -1) {
      // user not authorized: 404
      return error("You don't have permission to access this page.")
    }

    return success
  }

  return error("Something went wrong")
}
