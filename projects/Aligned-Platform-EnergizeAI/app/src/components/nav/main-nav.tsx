import { HelpingHand, LogInIcon, SettingsIcon } from "lucide-react"
import { pathToRegexp } from "path-to-regexp"
import { useState } from "react"

import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { MobileNav } from "./mobile-nav"
import { TasksDropdown } from "./tasks-dropdown"
import { UserDropdown } from "./user-dropdown"
import { energizeEngine } from "@/lib/energize-engine"
import { PERMISSIONS_MAP, Paths } from "@/lib/paths"
import { DEFAULT_SPACE_ID } from "@/lib/spaces"
import { cn } from "@/lib/utils"
import { SignInButton, useAuth } from "@clerk/clerk-react"
import { Bars3Icon, ChevronUpDownIcon, QuestionMarkCircleIcon, SparklesIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouter } from "next/router"

export interface NavLink {
  href: string
  matchingPaths?: string[]
  title: string
  icon?: React.ReactNode
  notification?: React.ReactNode
}

type Props = {
  className?: string
}

export const MainNav = ({ className }: Props) => {
  const { userId } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { space_id } = router.query

  const authRedirectUrl: string | undefined = `/spaces/${DEFAULT_SPACE_ID}`

  let protectedLinks: NavLink[] = []
  let rightSideLinks: NavLink[] = []

  if (space_id) {
    protectedLinks = [
      {
        href: Paths.Playground,
        title: "Playground",
        icon: <SparklesIcon className="h-5 w-5" />,
      },
      {
        href: Paths.MyGuidelines,
        title: "Contributions",
        icon: <HelpingHand className="h-5 w-5" />,
        matchingPaths: [Paths.MyGuidelines, Paths.MyRatings],
      },
    ]

    rightSideLinks = [
      {
        href: Paths.Instructions,
        title: "Help",
        icon: <QuestionMarkCircleIcon className="h-5 w-5" />,
      },
    ]
  }

  const roleQuery = energizeEngine.roles.getRoleInSpace.useQuery(
    {
      spaceId: space_id as string,
    },
    { enabled: !!space_id },
  )

  const adminOnlyPaths = Object.keys(PERMISSIONS_MAP).filter(
    (path) =>
      PERMISSIONS_MAP[path as Paths].allowedRoles.length === 1 &&
      PERMISSIONS_MAP[path as Paths].allowedRoles[0] === "admin",
  )
  if (roleQuery.data?.name === "admin") {
    protectedLinks.push({
      href: Paths.Members,
      title: "Admin",
      matchingPaths: adminOnlyPaths,
      icon: <SettingsIcon className="h-5 w-5" />,
    })
  }

  protectedLinks = protectedLinks.map((link) => ({
    ...link,
    href: link.href.replace(":id", space_id as string),
    matchingPaths: link.matchingPaths?.map((path) => path.replace(":id", space_id as string)),
  }))

  rightSideLinks = rightSideLinks.map((link) => ({
    ...link,
    href: link.href.replace(":id", space_id as string),
    matchingPaths: link.matchingPaths?.map((path) => path.replace(":id", space_id as string)),
  }))

  const hiddenPaths: Paths[] = [Paths.Home, Paths.Waitlist, Paths.NotFound, Paths.ShortenedUrl, Paths.Prolific]
  const pathname = usePathname()

  const matchedHiddenPath = hiddenPaths.find((path) => {
    const re = pathToRegexp(path)
    const match = re.exec(pathname)

    if (!match) {
      return false
    }

    return true
  })

  if (matchedHiddenPath) {
    return null
  }

  return (
    <>
      <div className={cn(className)}>
        <header className="z-50 border-b">
          <nav className="flex items-center justify-between px-5 lg:px-10" aria-label="Global">
            <div className="flex items-center gap-6 lg:flex-1">
              <Link href="/" className="h-18 group -m-1.5 flex items-center gap-2 p-1.5">
                <span className="sr-only">Aligned</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary group-hover:animate-wiggle">
                  <img src="/logo.png" alt="Logo" className="h-9 text-primary-foreground" />
                </div>
              </Link>
              {space_id || pathname === "/live" ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant={"ghost"}
                        className="whitespace-nowrap px-0 text-lg font-medium hover:bg-transparent"
                      >
                        OpenAI
                        <ChevronUpDownIcon className="ml-2 h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[300px] p-4 text-sm">
                      No other spaces available for account.
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <span className="font-outline -ml-2 text-2xl">Aligned</span>
              )}
              {userId && (
                <>
                  {protectedLinks.map(({ href, title, matchingPaths, icon }) => (
                    <div key={href} className="relative hidden py-3 lg:block">
                      <Link href={href} className={cn("flex items-center gap-2 rounded px-2 py-2 hover:bg-muted")}>
                        {icon && <>{icon}</>}
                        {title}
                      </Link>
                      {(pathname === href || (matchingPaths !== undefined && matchingPaths.includes(pathname))) && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded bg-primary" />
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
            <div className="flex py-5 lg:hidden">
              <button
                type="button"
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="sr-only">Open main menu</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="hidden h-16 items-center gap-4 lg:flex lg:flex-1 lg:justify-end">
              <TasksDropdown />
              {rightSideLinks.map(({ href, title, icon }) => (
                <div key={href} className="relative py-3">
                  <Link href={href} className={cn("flex items-center gap-2 rounded px-2 py-2 hover:bg-muted")}>
                    {icon && <>{icon}</>}
                    {title}
                  </Link>
                </div>
              ))}
              <div className="mx-2 h-8 w-[2px] bg-border" />
              {userId ? (
                <UserDropdown />
              ) : (
                <>
                  <Link href="/waitlist">
                    <Button variant="outline">Join Waitlist</Button>
                  </Link>
                  <SignInButton mode="redirect" redirectUrl={authRedirectUrl}>
                    <Button variant="outline" id="login-button">
                      Log in
                      <LogInIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </SignInButton>
                </>
              )}
            </div>
          </nav>
        </header>
        <MobileNav
          protectedLinks={protectedLinks}
          setMobileMenuOpen={setMobileMenuOpen}
          mobileMenuOpen={mobileMenuOpen}
        />
      </div>
    </>
  )
}
