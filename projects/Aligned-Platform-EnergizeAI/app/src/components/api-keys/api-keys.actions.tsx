import { MoreHorizontal, RefreshCwIcon, Trash } from "lucide-react"
import { useState } from "react"

import { AreYouSure } from "../ui/are-you-sure"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { useToast } from "../ui/use-toast"
import { energizeEngine } from "@/lib/energize-engine"
import { useRouter } from "next/router"

type Props = {
  entry: { id: string; createdAt: Date }
}

export const ApiKeyActions = ({ entry }: Props) => {
  const { space_id } = useRouter().query
  const deleteMutation = energizeEngine.apiKeys.revokeApiKey.useMutation()
  const rotateMutation = energizeEngine.apiKeys.rotateApiKey.useMutation()
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [showRotateConfirmation, setShowRotateConfirmation] = useState(false)

  const utils = energizeEngine.useContext()

  const { toast } = useToast()

  const handleDelete = async () => {
    deleteMutation.mutate(
      {
        spaceId: space_id as string,
        id: entry.id,
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "API key deleted successfully.",
            variant: "success",
          })
          utils.apiKeys.getApiKeys.refetch()
          setShowDeleteConfirmation(false)
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Something went wrong while deleting the API key.",
            variant: "destructive",
          })
        },
      },
    )
  }

  const handleRotate = async () => {
    await rotateMutation.mutate(
      {
        spaceId: space_id as string,
        id: entry.id,
      },
      {
        onSuccess: (newKey) => {
          navigator.clipboard.writeText(newKey)
          toast({
            title: "Success",
            description: "API key rotated successfully and copied to clipboard.",
            variant: "success",
          })
          utils.apiKeys.getApiKeys.refetch()
          setShowRotateConfirmation(false)
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Something went wrong while deleting the API key.",
            variant: "destructive",
          })
        },
      },
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="max-w-8 h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowRotateConfirmation(true)}>
            <RefreshCwIcon className="mr-2 h-4 w-4" />
            Rotate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowDeleteConfirmation(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AreYouSure
        confirmationMessage="Deleting this API key will revoke it and make it unusable."
        variant="destructive"
        handleConfirm={handleDelete}
        open={showDeleteConfirmation}
        setOpen={setShowDeleteConfirmation}
        isLoading={deleteMutation.isLoading}
      />
      <AreYouSure
        confirmationMessage="Rotating this API key will invalidate the old one."
        handleConfirm={handleRotate}
        open={showRotateConfirmation}
        setOpen={setShowRotateConfirmation}
        isLoading={rotateMutation.isLoading}
      />
    </>
  )
}
