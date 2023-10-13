import { useState } from "react"

import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog"
import { Input } from "../ui/input"
import { SmallSpinner } from "../ui/small-spinner"
import { useToast } from "../ui/use-toast"
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { energizeEngine } from "@/lib/energize-engine"
import { truncate } from "@/lib/utils"
import { useRouter } from "next/router"

type Props = {
  children?: React.ReactNode
  topicId: string
  title: string
}

export const DeleteTopicDialog = ({ children, topicId, title }: Props) => {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const { space_id } = useRouter().query

  const [confirmInput, setConfirmInput] = useState("")

  const utils = energizeEngine.useContext()

  const deleteMutation = energizeEngine.topics.hardDeleteTopic.useMutation()
  const handleConfirm = () => {
    deleteMutation.mutate(
      {
        spaceId: space_id as string,
        topicId,
      },
      {
        onSuccess: () => {
          utils.topics.getTopicsTree.refetch()
          setOpen(false)

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
  }

  const isLoading = deleteMutation.isLoading

  return (
    <Dialog open={open} onOpenChange={setOpen ? (v) => setOpen(v) : undefined}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will <b>permanently delete the topic and all of its children.</b> In
            addition, this action will delete all data associated with the topic: guidelines, ratings, chat messages,
            etc. Please type the word {`"Delete"`} to confirm.
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder={"Type the word 'Delete' to confirm"}
          value={confirmInput}
          onChange={(e) => setConfirmInput(e.target.value)}
        />
        <DialogFooter>
          <Button
            onClick={(e) => {
              e.preventDefault()
              handleConfirm()
            }}
            disabled={isLoading || confirmInput !== "Delete"}
            variant={"destructive"}
            className="w-full"
          >
            Delete {`"${truncate(title, 20)}"`}
            {isLoading && <SmallSpinner className="ml-2 text-white" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
