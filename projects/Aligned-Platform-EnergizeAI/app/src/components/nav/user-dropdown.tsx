import { LogOut, Moon, Sun, UserIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import QueryDataLoader from "../ui/query-data-loader"
import { Skeleton } from "../ui/skeleton"
import { UserScore } from "../users/user-score"
import { energizeEngine } from "@/lib/energize-engine"
import { toTitleCase, truncate } from "@/lib/utils"
import { useClerk, useUser } from "@clerk/clerk-react"
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import { useRouter } from "next/router"

export const UserDropdown = () => {
  const user = useUser()
  const { signOut } = useClerk()
  const router = useRouter()

  const handleSignOut = () => {
    signOut()
    router.push("/")
  }

  const userScoreQuery = energizeEngine.users.getUserScore.useQuery(undefined, {
    retry: false,
  })

  const { setTheme, theme } = useTheme()

  const switchTheme = () => {
    if (theme === "system") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("light")
    } else {
      setTheme("system")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative -ml-2 flex gap-3 px-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user?.imageUrl} alt="@shadcn" />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
          <UserScore />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            {user.user?.firstName && (
              <p className="text-sm font-medium leading-none">
                {user.user?.firstName} {user.user?.lastName}
              </p>
            )}
            {user.user?.primaryEmailAddress && (
              <p className="text-xs leading-none text-muted-foreground">
                {truncate(user.user?.primaryEmailAddress.emailAddress ?? "", 25)}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        {!userScoreQuery.isError && (
          <>
            <DropdownMenuSeparator />
            <QueryDataLoader queryResults={userScoreQuery} skeletonItems={1} addSkeletonContainer={false}>
              <QueryDataLoader.IsLoading>
                <div className="flex w-full flex-col gap-1">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </div>
              </QueryDataLoader.IsLoading>
              <QueryDataLoader.IsSuccess>
                <DropdownMenuItem className="pointer-events-none">
                  ✋
                  <span className="ml-2 font-semibold">
                    {userScoreQuery.data?.score.authored_guidelines_count ?? 0}
                  </span>
                  <span className="ml-1 text-muted-foreground">proposed guidelines</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="pointer-events-none">
                  💙
                  <span className="ml-2 font-semibold">{userScoreQuery.data?.score.helpful_ratings_count ?? 0}</span>
                  <span className="ml-1 text-muted-foreground">helpful ratings</span>
                </DropdownMenuItem>
              </QueryDataLoader.IsSuccess>
            </QueryDataLoader>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault()
            switchTheme()
          }}
        >
          <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span>{toTitleCase(theme ?? "System")} theme</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <Link href={"/account/profile"}>
          <DropdownMenuItem>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>My Account</span>
          </DropdownMenuItem>
        </Link>
        <Link href={"/feedback"}>
          <DropdownMenuItem>
            <QuestionMarkCircleIcon className="mr-2 h-4 w-4" />
            <span>Feedback</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem onClick={() => handleSignOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
