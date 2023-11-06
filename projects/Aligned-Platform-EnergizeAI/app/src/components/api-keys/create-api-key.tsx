import { motion } from "framer-motion"
import { CopyIcon, KeyIcon, PlusIcon } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { CopyButton } from "../ui/copy-button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { SmallSpinner } from "../ui/small-spinner"
import { useToast } from "../ui/use-toast"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { energizeEngine } from "@/lib/energize-engine"
import { truncate } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { DialogDescription } from "@radix-ui/react-dialog"
import { useRouter } from "next/router"

const formSchema = z.object({
  name: z.string().nonempty(),
  permissions: z.enum(["read", "write", "owner"]),
})

type FormValues = z.infer<typeof formSchema>

export function CreateApiKey() {
  const { space_id } = useRouter().query
  const [open, setOpen] = useState(false)
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  const { toast } = useToast()
  const utils = energizeEngine.useContext()

  const submitMutation = energizeEngine.apiKeys.createApiKey.useMutation()
  function onSubmit(data: FormValues) {
    submitMutation.mutate(
      {
        spaceId: space_id as string,
        name: data.name,
        permissions: data.permissions,
      },
      {
        onSuccess: (key) => {
          setCreatedKey(key)
          form.reset({ name: "" })
          utils.apiKeys.getApiKeys.refetch()
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

  const dialogContent = !createdKey ? (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create new key</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter name..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="permissions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Permissions</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose permissions..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="write">Write</SelectItem>
                    <SelectItem value="owner">Owner (both read and write)</SelectItem>
                  </SelectContent>
                </Select>
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
  ) : (
    <DialogContent>
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <DialogHeader>
          <DialogTitle>Success! 🎉</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Your new API key has been created. Please copy it and store it somewhere safe. After you close this dialog,
            you will not be able to see it again. If you lose it, you will have to create a new one.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex items-start gap-2">
          <code className="whitespace-wrap max-w-full flex-1 rounded border p-2 shadow-md">
            {truncate(createdKey, 35)}
          </code>
          <CopyButton text={createdKey} className="h-10 w-10" />
        </div>
      </motion.div>
    </DialogContent>
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)

        if (!v) {
          setCreatedKey(null)
          form.reset({ name: "" })
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <KeyIcon className="mr-2 h-4 w-4" />
          Create new key
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  )
}
