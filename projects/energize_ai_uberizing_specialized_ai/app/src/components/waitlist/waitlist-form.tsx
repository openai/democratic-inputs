import { ArrowLeft, CheckIcon, SmileIcon } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SmallSpinner } from "@/components/ui/small-spinner"
import { Textarea } from "@/components/ui/textarea"
import { energizeEngine } from "@/lib/energize-engine"
import { cn } from "@/lib/utils"
import { waitlistFormSchema } from "@/types/waitlist-types"
import { useAuth, useUser } from "@clerk/clerk-react"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/router"

type Props = {
  spaceId: string
}

export const WaitlistForm = ({ spaceId }: Props) => {
  const { userId } = useAuth()
  const { user } = useUser()

  const form = useForm<z.infer<typeof waitlistFormSchema>>({
    resolver: zodResolver(waitlistFormSchema),
  })

  // check for email in query params
  const router = useRouter()
  const email = router.query.email as string | undefined
  useEffect(() => {
    if (email) {
      form.setValue("email", email)
    }
  }, [email])

  const createWaitlistMutation = energizeEngine.waitlists.createWaitlistEntry.useMutation()

  async function onSubmit(values: z.infer<typeof waitlistFormSchema>) {
    if (createWaitlistMutation.isLoading || createWaitlistMutation.isSuccess) return
    await createWaitlistMutation.mutateAsync({
      ...values,
      spaceId: spaceId,
    })
  }

  const waitlistStatus = energizeEngine.waitlists.isEmailWaitlistApproved.useQuery(
    {
      email: user?.primaryEmailAddress?.emailAddress,
      spaceId: spaceId,
    },
    {
      enabled:
        user !== null && user !== undefined && !!user.primaryEmailAddress && !!user.primaryEmailAddress.emailAddress,
    },
  )

  return (
    <div className="mt-16 flex flex-1 flex-col gap-4 py-0 lg:mx-auto lg:w-1/2">
      <div className="flex flex-col gap-2">
        <h1 className="flex scroll-m-20 items-center gap-3 text-2xl font-bold tracking-tight lg:text-3xl">
          <Link
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary group-hover:animate-wiggle"
            href="/"
          >
            <img src="/logo.png" alt="Logo" className="h-9 text-primary-foreground" />
          </Link>
          Join the waitlist
        </h1>
        <p className="text-muted-foreground">
          We are excited to have you onboard! As of now we&apos;re gradually accepting members. For more information,
          please email{" "}
          <Link href="mailto:info@energize.ai" className="underline">
            info@energize.ai
          </Link>
          .
        </p>
      </div>
      {userId && waitlistStatus.data ? (
        <div className="flex w-full items-center gap-4 py-10 text-success">
          <SmileIcon className="h-8 w-8 text-success" />
          You are already off the waitlist!{" "}
        </div>
      ) : userId ? (
        <div className="flex w-full items-center gap-4 py-10 text-success">
          Your email is on the waitlist! We will be in touch ASAP with an invite link.
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter first name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter last name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="questionAnswer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Biggest issue with LLMs today?
                    <small className="ml-2 text-muted-foreground">(optional)</small>
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter answer..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className={cn(
                createWaitlistMutation.isLoading && "cursor-not-allowed opacity-50",
                "w-full md:w-min lg:w-min",
                createWaitlistMutation.isSuccess && "bg-success hover:bg-success",
              )}
            >
              {createWaitlistMutation.isLoading ? (
                <div className="flex items-center space-x-2">
                  <span>Submitting</span>
                  <SmallSpinner />
                </div>
              ) : createWaitlistMutation.isSuccess ? (
                <div className="flex items-center space-x-2">
                  <span>Submitted!</span>
                  <CheckIcon className="h-4 w-4" />
                </div>
              ) : (
                "Submit"
              )}
            </Button>
            {createWaitlistMutation.isSuccess && (
              <small className="block text-success">
                <SmileIcon className="mr-2 inline-block h-4 w-4" />
                Thank you for your joining the waitlist! We will be in touch <strong>ASAP</strong> with an invite link.
              </small>
            )}
            {!userId && !createWaitlistMutation.isSuccess && (
              <Link href="/" className="block cursor-pointer pt-4 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="mr-2 inline-block h-4 w-4" />
                Go back home
              </Link>
            )}
          </form>
        </Form>
      )}
    </div>
  )
}
