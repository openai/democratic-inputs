import { motion } from "framer-motion"
import { useState } from "react"

import { TrendingGuidelines } from "@/components/guidelines/trending-guidelines"
import { UserDropdown } from "@/components/nav/user-dropdown"
import { Button } from "@/components/ui/button"
import QueryDataLoader from "@/components/ui/query-data-loader"
import { SmallSpinner } from "@/components/ui/small-spinner"
import { useToast } from "@/components/ui/use-toast"
import { energizeEngine } from "@/lib/energize-engine"
import { Paths, SEARCH_PARAM_KEYS } from "@/lib/paths"
import { DEFAULT_SPACE_ID } from "@/lib/spaces"
import { SignInButton, useAuth, useUser } from "@clerk/clerk-react"
import Head from "next/head"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"

export default function Home() {
  const [showInstructions, setShowInstructions] = useState(false)

  const { userId } = useAuth()
  const { user } = useUser()

  const { toast } = useToast()
  const router = useRouter()

  const joinMutation = energizeEngine.roles.joinSpaceAsMember.useMutation()
  const completedInstructionsMutation = energizeEngine.users.setCompletedInstructions.useMutation()

  const waitlistStatus = energizeEngine.waitlists.isEmailWaitlistApproved.useQuery(
    {
      email: user?.primaryEmailAddress?.emailAddress,
      spaceId: DEFAULT_SPACE_ID,
    },
    {
      enabled: user !== null && user !== undefined,
      retry: false,
    },
  )

  const completedInstructionsQuery = energizeEngine.users.getHasCompletedInstructions.useQuery(undefined, {
    enabled: user !== null && user !== undefined,
    retry: false,
  })

  const roleQuery = energizeEngine.roles.getRoleInSpace.useQuery(
    {
      spaceId: DEFAULT_SPACE_ID,
    },
    {
      enabled: Boolean(userId),
      retry: false,
    },
  )

  const handleJoin = async (guidelineId?: string | null, topicId?: string | null) => {
    if (waitlistStatus.isLoading || roleQuery.isLoading || completedInstructionsQuery.isLoading) return

    const goToOrg = () => {
      const url = new URL(`/spaces/${DEFAULT_SPACE_ID}`, window.location.href)

      if (guidelineId) {
        url.searchParams.set(SEARCH_PARAM_KEYS[Paths.Playground].guidelineId, guidelineId)
      }

      if (topicId) {
        url.searchParams.set(SEARCH_PARAM_KEYS[Paths.Playground].topicId, topicId)
      }

      router.push(url)
    }

    // if the user is not on the waitlist, don't let them join
    if (waitlistStatus.isSuccess && !waitlistStatus.data) {
      toast({
        title: "Error",
        description: "You are not on the waitlist",
        variant: "destructive",
      })
      return
    }

    if (completedInstructionsQuery.data !== true && !showInstructions) {
      setShowInstructions(true)
      return
    } else if (completedInstructionsQuery.data !== true && showInstructions) {
      await completedInstructionsMutation.mutateAsync()
    }

    // if the user is already a member of the org, skip to the org
    if (roleQuery.isSuccess && roleQuery.data) {
      goToOrg()
      return
    }

    // join the org
    joinMutation.mutate(
      {
        spaceId: DEFAULT_SPACE_ID,
      },
      {
        onSuccess: goToOrg,
        onError: (err) => {
          toast({
            title: "Error",
            description: err.message,
            variant: "destructive",
          })
        },
      },
    )
  }

  const instructionSection = (
    <div className="flex flex-1 flex-col space-y-9 font-outfit font-[400]">
      <p>Welcome, {user?.firstName}.</p>
      <p>You have been invited to shape the future of AI.</p>
      <p>
        We&apos;re crafting <u>guidelines for AI</u> to follow in grey-area topics like politics.
      </p>
      <p>
        Your input is crucial: we need you to <u>test and review</u> others&apos; proposed guidelines.
      </p>
      <p>Our Aligned chatbot will help you simulate each guideline&apos;s impact on AI behavior.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleJoin()
        }}
      >
        <input type="checkbox" id="terms" name="terms" required />
        <label htmlFor="terms" className="ml-1 text-xs text-gray-500">
          By joining, you agree to the &nbsp;
          <Link href="https://energize.ai/privacy-policy" rel="noopener noreferrer" target="_blank">
            <u>Privacy Policy</u>
          </Link>
          &nbsp;and&nbsp;
          <Link rel="noopener noreferrer" href="https://energize.ai/terms" target="_blank">
            <u>Terms and Use</u>&nbsp;
          </Link>
          .
        </label>
        <Button
          type="submit"
          disabled={joinMutation.isLoading}
          variant={"outline"}
          className="mx-auto my-auto mt-6 flex w-full items-center justify-center whitespace-nowrap"
        >
          Join Aligned
          {joinMutation.isLoading && <SmallSpinner className="ml-2" />}
        </Button>
      </form>
    </div>
  )

  const body = (
    <>
      Welcome to
      <h1 className="text-center text-6xl font-medium lg:text-left lg:text-8xl">Aligned.</h1>
      {!userId ? (
        <div className="mt-10 flex flex-col gap-4 lg:flex-row">
          <SignInButton redirectUrl={router.query.redirectUrl as string}>
            <Button variant={"outline"} id="login-button" className="w-full lg:w-[120px]">
              Login
            </Button>
          </SignInButton>
          <Link href="/waitlist">
            <Button variant={"outline"} className="w-full lg:w-[120px]">
              Join Waitlist
            </Button>
          </Link>
        </div>
      ) : (
        <QueryDataLoader
          queryResults={waitlistStatus}
          skeletonItems={1}
          forceState={roleQuery.isLoading || completedInstructionsQuery.isLoading ? "loading" : undefined}
          showEmptyState={false}
        >
          <QueryDataLoader.IsSuccess>
            {waitlistStatus.data === true ? (
              <Button
                disabled={joinMutation.isLoading}
                variant={"outline"}
                onClick={() => handleJoin()}
                className="mt-10 w-full whitespace-nowrap lg:w-min"
              >
                Get started
                {joinMutation.isLoading && <SmallSpinner className="ml-2" />}
              </Button>
            ) : (
              <Link href="/waitlist">
                <Button variant={"outline"} className="mt-10 w-[200px]">
                  Check Waitlist
                </Button>
              </Link>
            )}
          </QueryDataLoader.IsSuccess>
          <QueryDataLoader.IsLoading>
            <Button disabled={true} className="mt-10 w-full animate-pulse bg-muted lg:w-[120px]" />
          </QueryDataLoader.IsLoading>
        </QueryDataLoader>
      )}
      <div className="mx-auto my-10 h-24 w-[2px] bg-border lg:hidden" />
      <p className="mb-4 text-muted-foreground lg:mt-20">Trending guidelines from the community</p>
      <TrendingGuidelines
        handleGuidelineClick={(guidelineId, topicID) => {
          if (!userId) {
            const el = document.getElementById("login-button")
            if (el) {
              el.click()
            }
          } else {
            handleJoin(guidelineId, topicID)
          }
        }}
      />
    </>
  )

  return (
    <>
      <Head>
        <title>Aligned - Democratizing Model Alignment</title>
      </Head>
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-16 lg:-mt-7 lg:min-h-screen lg:gap-0">
        <div className="flex w-full flex-col justify-center gap-4 lg:flex-row lg:justify-end">
          <Link href="/live" className="mx-auto lg:mx-0">
            <Button variant="link">View constitution</Button>
          </Link>
          {userId && <UserDropdown />}
        </div>
        <div className="flex w-full flex-col items-center gap-16 text-center lg:flex-row lg:text-left">
          <motion.img
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            src="/logothin.png"
            alt="Logo"
            className="w-56 flex-1 text-primary-foreground opacity-100 dark:opacity-70"
          />
          <div className="flex flex-1 flex-col">{showInstructions ? instructionSection : body}</div>
        </div>
        <div className="mb-10 mt-16 flex w-full flex-col items-center gap-16 lg:flex-row lg:justify-between">
          <Image
            src={"/EnergizeLogoFull.png"}
            alt={"energize logo full"}
            className="object-fit rounded-md"
            height={50}
            width={180}
          />
          <Link
            href={"https://openai.com/blog/democratic-inputs-to-ai"}
            rel="noopener noreferrer"
            target="_blank"
            className="flex items-center justify-center gap-4 text-2xl hover:underline"
          >
            <Image
              src={"/images/democratic-inputs-to-ai.png"}
              alt={"democratic inputs to ai"}
              className="object-fit rounded-md"
              width={50}
              height={50}
            />
            OpenAI Democratic Grant
          </Link>
        </div>
      </div>
    </>
  )
}
