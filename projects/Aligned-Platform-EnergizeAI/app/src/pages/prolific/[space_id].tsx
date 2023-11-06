import { CheckIcon } from "lucide-react"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { HowItWorksCards } from "../algo"
import { Redirect } from "@/components/redirect"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SmallSpinner } from "@/components/ui/small-spinner"
import { useToast } from "@/components/ui/use-toast"
import { energizeEngine } from "@/lib/energize-engine"
import { sleep } from "@/lib/utils"
import { useAuth, useSignIn } from "@clerk/clerk-react"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/router"

const formSchema = z.object({
  email: z
    .string()
    .email()
    .refine((email) => email.endsWith("email.prolific.co")),
  acceptTerms: z.boolean().refine((acceptTerms) => acceptTerms === true),
})

type FormValues = z.infer<typeof formSchema>

export default function ProlificCapturePage() {
  const { space_id } = useRouter().query
  const { signIn, setActive, isLoaded } = useSignIn()

  const [isLoadingSignup, setIsLoadingSignup] = useState(false)

  const { userId } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()

  const prolificPid = searchParams.get("PROLIFIC_PID")
  const studyId = searchParams.get("STUDY_ID")
  const sessionId = searchParams.get("SESSION_ID")
  const accessToken = searchParams.get("ACCESS_TOKEN")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: `${prolificPid}@email.prolific.co`,
    },
  })

  const valid = energizeEngine.prolific.verifyProlificParams.useQuery(
    {
      prolificPid: prolificPid ?? "",
      spaceId: space_id as string,
      studyId: studyId ?? "",
      sessionId: sessionId ?? "",
      accessToken: accessToken ?? "",
    },
    {
      enabled: Boolean(prolificPid && studyId && sessionId),
    },
  )

  const prolificIdMutation = energizeEngine.prolific.setProlificIdentifiers.useMutation()

  const { toast } = useToast()

  const handleGetStarted = () => {
    if (!userId || !valid.data?.valid || !prolificPid || !space_id) return

    const goToOrg = () => {
      const url = new URL(`/spaces/${space_id}`, window.location.href)
      router.push(url)
    }

    prolificIdMutation.mutate(
      {
        prolificPid,
        studyId: studyId ?? "",
        sessionId: sessionId ?? "",
        spaceId: space_id as string,
      },
      {
        onSuccess: async () => {
          toast({
            title: "Success",
            description: "Your prolific ID has been linked!",
            variant: "success",
          })

          await sleep(500)

          goToOrg()
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          })
        },
      },
    )
  }

  const userMutation = energizeEngine.prolific.createProlificUser.useMutation()
  async function onSubmit(data: FormValues) {
    if (!signIn || !isLoaded) return

    setIsLoadingSignup(true)

    try {
      const res = await userMutation.mutateAsync({
        email: data.email,
        prolificPid: prolificPid ?? "",
      })

      // Create a sign in with the ticket strategy, and the sign-in-token
      const signInRes = await signIn.create({
        strategy: "ticket",
        ticket: res.signInToken,
      })

      // Set the session as active, and then do whatever you need to!
      setActive({
        session: signInRes.createdSessionId,
      })
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingSignup(false)
    }
  }

  if (!prolificPid || !studyId || !sessionId) {
    return <Redirect redirectTo="/404" />
  }

  const emailForm = (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter email..."
                      {...field}
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      disabled={true}
                    />
                  </FormControl>
                  <FormDescription>
                    Must end in <code>email.prolific.co</code>.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start gap-2 rounded-md pb-4">
                  <FormControl>
                    <Checkbox className="mt-2" checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel>
                    By clicking continue, you agree to our{" "}
                    <Link href="https://energize.ai/terms" className="underline underline-offset-4 hover:text-primary">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="https://energize.ai/privacy-policy"
                      className="underline underline-offset-4 hover:text-primary"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </FormLabel>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoadingSignup}>
              {isLoadingSignup && <SmallSpinner className="mr-2 h-4 w-4" />}
              Continue
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )

  if (valid.isLoading) {
    return (
      <div className="flex h-[90vh] w-full flex-col items-center justify-center">
        <div className="flex items-center gap-2 rounded border bg-muted px-5 py-2">
          Validating your account...
          <SmallSpinner />
        </div>
      </div>
    )
  }

  if (valid.error) {
    return <Redirect redirectTo="/404" />
  }

  return (
    <div className="flex w-full flex-col items-center justify-center gap-6">
      {!userId ? (
        <>
          <h1 className="mt-36 flex items-center gap-2 text-xl">
            Hey! 👋 Welcome to Aligned!
            <Link href={"/"}>
              <img src="/logo.png" alt="Logo" className="h-6 text-primary-foreground" />
            </Link>
          </h1>
          {emailForm}
        </>
      ) : (
        <>
          <h1 className="mt-10 flex items-center gap-2 text-xl">
            How it works
            <Link href={"/"}>
              <img src="/logo.png" alt="Logo" className="h-6 text-primary-foreground" />
            </Link>
          </h1>
          <HowItWorksCards className="mt-0 max-w-4xl" />
          <Button
            disabled={prolificIdMutation.isLoading}
            className="animate-fade-in whitespace-nowrap px-24"
            onClick={handleGetStarted}
          >
            Get Started
            {prolificIdMutation.isLoading && <SmallSpinner className="ml-2" />}
          </Button>
        </>
      )}
    </div>
  )
}
