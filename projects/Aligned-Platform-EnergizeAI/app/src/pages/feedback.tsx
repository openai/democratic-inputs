import { CheckIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SmallSpinner } from "@/components/ui/small-spinner"
import { Textarea } from "@/components/ui/textarea"
import { energizeEngine } from "@/lib/energize-engine"
import { cn } from "@/lib/utils"
import { FeedbackFormSchema } from "@energizeai/engine"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"

export default function FeedbackPage() {
  const form = useForm<z.infer<typeof FeedbackFormSchema>>({
    resolver: zodResolver(FeedbackFormSchema),
    defaultValues: {
      subject: "",
      message: "",
    },
  })

  const createFeedbackMutation = energizeEngine.feedbacks.createFeedback.useMutation()

  async function onSubmit(values: z.infer<typeof FeedbackFormSchema>) {
    await createFeedbackMutation.mutateAsync(values)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 py-10 lg:mx-auto lg:w-1/2">
      <div className="flex flex-col gap-2">
        <h1 className="scroll-m-20 text-2xl font-bold tracking-tight lg:text-3xl">Feedback</h1>
        <p className="text-muted-foreground">
          We want to hear from you! Please send us your feedback below or email us at{" "}
          <Link href="mailto:info@energize.ai" className="underline">
            info@energize.ai
          </Link>
          .
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-8">
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <Input placeholder="Enter subject..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter your feedback..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className={cn(
              createFeedbackMutation.isLoading && "cursor-not-allowed opacity-50",
              "w-full md:w-min lg:w-min",
              createFeedbackMutation.isSuccess && "bg-success hover:bg-success",
            )}
          >
            {createFeedbackMutation.isLoading ? (
              <div className="flex items-center space-x-2">
                <span>Submitting</span>
                <SmallSpinner />
              </div>
            ) : createFeedbackMutation.isSuccess ? (
              <div className="flex items-center space-x-2">
                <span>Submitted!</span>
                <CheckIcon className="h-4 w-4" />
              </div>
            ) : (
              "Submit"
            )}
          </Button>
          {createFeedbackMutation.isSuccess && (
            <small className="block text-muted-foreground">
              Thank you for your feedback! We will be in touch shortly.
            </small>
          )}
        </form>
      </Form>
    </div>
  )
}
