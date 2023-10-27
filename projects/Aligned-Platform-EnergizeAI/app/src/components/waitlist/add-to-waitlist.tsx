import { PlusIcon } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { AutoComplete } from "../ui/autocomplete"
import { Checkbox } from "../ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { SmallSpinner } from "../ui/small-spinner"
import { Textarea } from "../ui/textarea"
import { useToast } from "../ui/use-toast"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { energizeEngine } from "@/lib/energize-engine"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/router"

const formSchema = z.object({
  emails: z.string().nonempty(),
  source: z.string(),
  markApproved: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

export function AddToWaitlist() {
  const { space_id } = useRouter().query
  const [open, setOpen] = useState(false)
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      markApproved: true,
    },
  })

  const { toast } = useToast()
  const utils = energizeEngine.useContext()

  const sourceOptions = energizeEngine.waitlists.getSourceOptions.useQuery({
    spaceId: space_id as string,
  })

  const submitMutation = energizeEngine.waitlists.createWaitlistEntriesForEmails.useMutation()
  function onSubmit(data: FormValues) {
    submitMutation.mutate(
      {
        spaceId: space_id as string,
        emails: data.emails.split("\n").map((email) => email.trim()),
        source: data.source ?? null,
        markAsApproved: data.markApproved,
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Successfully added to waitlist.",
            variant: "success",
          })

          setOpen(false)
          form.reset({ emails: "", markApproved: true })

          utils.waitlists.getWaitlistEntries.invalidate()
          utils.waitlists.getSourceOptions.invalidate()
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
          Add to waitlist
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to waitlist</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="emails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emails</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter emails..." {...field} />
                  </FormControl>
                  <FormDescription>Enter emails seperated by new lines.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <FormControl>
                    <AutoComplete
                      options={(sourceOptions.data as string[]) ?? []}
                      emptyMessage="No results."
                      placeholder="Enter source..."
                      isLoading={sourceOptions.isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                    />
                  </FormControl>
                  <FormDescription>Where are these emails from?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="markApproved"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Automatically mark entries as approved.</FormLabel>
                  </div>
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
