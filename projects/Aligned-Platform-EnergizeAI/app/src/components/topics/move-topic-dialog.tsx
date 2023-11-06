import { useState } from "react"

import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog"
import { Input } from "../ui/input"
import { SmallSpinner } from "../ui/small-spinner"
import { useToast } from "../ui/use-toast"
import { TopicTreeMenu } from "./topic-tree-menu"
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { energizeEngine } from "@/lib/energize-engine"
import { truncate } from "@/lib/utils"
import { useRouter } from "next/router"

type Props = {
  children?: React.ReactNode
  topicId: string
  title: string
}

export const MoveTopicDialog = ({ children, topicId, title }: Props) => {
  const [newTopicId, setNewTopicId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const { space_id } = useRouter().query

  const [confirmInput, setConfirmInput] = useState("")

  const utils = energizeEngine.useContext()

  const moveMutation = energizeEngine.topics.moveTopic.useMutation()
  const handleConfirm = () => {
    moveMutation.mutate(
      {
        spaceId: space_id as string,
        topicId,
        newParentId: newTopicId || null,
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

  const isLoading = moveMutation.isLoading

  return (
    <Dialog open={open} onOpenChange={setOpen ? (v) => setOpen(v) : undefined}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move topic to new parent</DialogTitle>
          <DialogDescription>
            This will <b>move the topic and all of its children.</b>{" "}
            <u>If you want to move the topic to the top level, leave the new parent topic blank.</u> Please type the
            word {`"Move"`} to confirm.
          </DialogDescription>
        </DialogHeader>
        <TopicTreeMenu
          currentTopicId={newTopicId}
          handleNewTopicId={setNewTopicId}
          className="flex-1 whitespace-nowrap border bg-background text-foreground hover:bg-muted"
          placeholder="Select new parent topic"
          shouldUseQueryState={false}
        />
        <Input
          placeholder={"Type the word 'Move' to confirm"}
          className="min-w-full"
          value={confirmInput}
          onChange={(e) => setConfirmInput(e.target.value)}
        />
        <DialogFooter>
          <Button
            onClick={(e) => {
              e.preventDefault()
              handleConfirm()
            }}
            disabled={isLoading || confirmInput !== "Move"}
            variant={"warning"}
            className="w-full"
          >
            Move {`"${truncate(title, 20)}"`}
            {isLoading && <SmallSpinner className="ml-2 text-white" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
