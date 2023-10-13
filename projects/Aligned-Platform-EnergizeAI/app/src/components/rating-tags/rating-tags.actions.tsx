import { CopyIcon, MoreHorizontal, Trash } from "lucide-react"
import { useState } from "react"

import { AreYouSure } from "../ui/are-you-sure"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { energizeEngine } from "@/lib/energize-engine"
import { useRouter } from "next/router"

type Props = {
  entry: { id: string; value: string; createdAt: Date }
}

export const RatingTagActions = ({ entry }: Props) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const deleteMutation = energizeEngine.ratingTags.hardDeleteRatingTag.useMutation()
  const { space_id } = useRouter().query

  const utils = energizeEngine.useContext()

  const handleDelete = async () => {
    await deleteMutation.mutateAsync({
      spaceId: space_id as string,
      id: entry.id,
    })

    utils.ratingTags.getRatingTags.refetch()

    setShowDeleteConfirmation(false)
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
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(entry.value)}>
            <CopyIcon className="mr-2 h-4 w-4" />
            Copy tag
          </DropdownMenuItem>
          <DropdownMenuItem className="w-full" onClick={() => setShowDeleteConfirmation(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AreYouSure
        confirmationMessage="Deleting this tag will remove it from all ratings that have it."
        variant="destructive"
        handleConfirm={handleDelete}
        open={showDeleteConfirmation}
        setOpen={setShowDeleteConfirmation}
        isLoading={deleteMutation.isLoading}
      />
    </>
  )
}
