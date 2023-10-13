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
  title: z.string().nonempty(),
  description: z.string().nonempty(),
})

type FormValues = z.infer<typeof formSchema>

type Props = {
  defaultValue?: FormValues & {
    id: string
  }
  parentTopicId?: string | null
  children: React.ReactNode
}

export const TopicForm = ({ defaultValue, children, parentTopicId }: Props) => {
  const { toast } = useToast()
  const { space_id } = useRouter().query

  const [open, setOpen] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: defaultValue ? defaultValue.title : "",
      description: defaultValue ? defaultValue.description : "",
    },
  })

  const updateMutation = energizeEngine.topics.updateTopic.useMutation()
  const createMutation = energizeEngine.topics.createTopic.useMutation()

  const utils = energizeEngine.useContext()

  function onSubmit(data: FormValues) {
    if (defaultValue) {
      updateMutation.mutate(
        {
          spaceId: space_id as string,
          topicId: defaultValue.id,
          title: data.title,
          description: data.description,
        },
        {
          onSuccess: () => {
            utils.topics.getTopicsTree.refetch()
            setOpen(false)

            form.reset()

            toast({
              title: "Success",
              description: "Topic updated successfully!",
              variant: "success",
            })
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
    } else {
      createMutation.mutate(
        {
          spaceId: space_id as string,
          title: data.title,
          description: data.description,
          parentId: parentTopicId,
        },
        {
          onSuccess: () => {
            utils.topics.getTopicsTree.refetch()
            setOpen(false)

            form.reset()

            toast({
              title: "Success",
              description: "Topic created successfully!",
              variant: "success",
            })
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
  }

  const isLoading = updateMutation.isLoading || createMutation.isLoading

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{defaultValue ? "Edit Topic" : "Create Topic"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter description..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                Submit
                {isLoading && <SmallSpinner className="ml-2" />}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
