import { PlusIcon } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { SmallSpinner } from "../ui/small-spinner"
import { Textarea } from "../ui/textarea"
import { useToast } from "../ui/use-toast"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { energizeEngine } from "@/lib/energize-engine"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/router"

const formSchema = z.object({
  prompt: z.string().nonempty(),
  authorUsername: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

type Props = {
  topicId: string
}

export function AddToPromptPool({ topicId }: Props) {
  const { space_id } = useRouter().query
  const [open, setOpen] = useState(false)
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  const { toast } = useToast()
  const utils = energizeEngine.useContext()

  const submitMutation = energizeEngine.prompts.createPrompt.useMutation()
  function onSubmit(data: FormValues) {
    submitMutation.mutate(
      {
        spaceId: space_id as string,
        value: data.prompt,
        topicId,
        authorUsername: data.authorUsername,
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Successfully added to prompt pool.",
            variant: "success",
          })

          setOpen(false)
          form.reset({ prompt: "" })

          utils.prompts.getPrompts.refetch()
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
          Add to prompt pool
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to prompt pool</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter prompt..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="authorUsername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author Username (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter username..." {...field} />
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
