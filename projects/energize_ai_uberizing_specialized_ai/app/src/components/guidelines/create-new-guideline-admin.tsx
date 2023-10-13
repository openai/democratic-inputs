import { PlusIcon } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { SmallSpinner } from "../ui/small-spinner"
import { Textarea } from "../ui/textarea"
import { useToast } from "../ui/use-toast"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { energizeEngine } from "@/lib/energize-engine"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/router"

const formSchema = z.object({
  guideline: z.string().nonempty(),
})

type FormValues = z.infer<typeof formSchema>

type Props = {
  topicId: string
}

export function CreateNewGuidelineAdmin({ topicId }: Props) {
  const { space_id } = useRouter().query
  const [open, setOpen] = useState(false)
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  const { toast } = useToast()
  const utils = energizeEngine.useContext()

  const submitMutation = energizeEngine.guidelines.createGuideline.useMutation()
  function onSubmit(data: FormValues) {
    submitMutation.mutate(
      {
        spaceId: space_id as string,
        value: data.guideline,
        topicId,
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Successfully added guideline.",
            variant: "success",
          })

          setOpen(false)
          form.reset({ guideline: "" })

          utils.guidelines.getGuidelinesForTopicWithRatingCount.refetch()
        },
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

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2" />
          Create new guideline
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new guideline</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="guideline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guideline</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter guideline..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={submitMutation.isLoading}>
                Submit
                {submitMutation.isLoading && <SmallSpinner className="ml-2" />}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
