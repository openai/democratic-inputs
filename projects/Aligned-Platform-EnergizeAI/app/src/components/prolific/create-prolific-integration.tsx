import { PlusIcon } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { SmallSpinner } from "../ui/small-spinner"
import { useToast } from "../ui/use-toast"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { energizeEngine } from "@/lib/energize-engine"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/router"

const formSchema = z.object({
  studyId: z.string().nonempty(),
  completionCode: z.string().nonempty(),
})

type FormValues = z.infer<typeof formSchema>

export function CreateProlificIntegration() {
  const { space_id } = useRouter().query
  const [open, setOpen] = useState(false)
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  const { toast } = useToast()
  const utils = energizeEngine.useContext()

  const submitMutation = energizeEngine.prolific.createProlificIntegration.useMutation()
  function onSubmit(data: FormValues) {
    submitMutation.mutate(
      {
        spaceId: space_id as string,
        studyId: data.studyId,
        completionCode: data.completionCode,
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Successfully added prolific integration.",
            variant: "success",
          })

          setOpen(false)
          form.reset({
            studyId: "",
            completionCode: "",
          })

          utils.prolific.getProlificIntegrationsForSpace.refetch()
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
          Add new study
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new study</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="studyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Study ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Study ID..." {...field} />
                  </FormControl>
                  <FormDescription>Enter the Prolific Study ID</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="completionCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Completion Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter completion code..." {...field} />
                  </FormControl>
                  <FormDescription>Enter the completion code of the Prolific Study</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={submitMutation.isLoading}>
                Link study
                {submitMutation.isLoading && <SmallSpinner className="ml-2" />}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
