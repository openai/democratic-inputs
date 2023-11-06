import { MoreHorizontal, Trash } from "lucide-react"
import { useState } from "react"

import { AreYouSure } from "../ui/are-you-sure"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { useToast } from "../ui/use-toast"
import { energizeEngine } from "@/lib/energize-engine"
import { EnergizeEngineOutputs } from "@energizeai/engine"
import { useRouter } from "next/router"

type RowDataType = EnergizeEngineOutputs["prolific"]["getProlificIntegrationsForSpace"][number]

type Props = {
  entry: RowDataType
}

export const ProlificIntegrationActions = ({ entry }: Props) => {
  const { space_id } = useRouter().query
  const deleteMutation = energizeEngine.prolific.hardDeleteProlificIntegration.useMutation()
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

  const utils = energizeEngine.useContext()

  const { toast } = useToast()

  const handleDelete = async () => {
    deleteMutation.mutate(
      {
        spaceId: space_id as string,
        studyId: entry.studyId,
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Prolific integration deleted successfully.",
            variant: "success",
          })
          utils.prolific.getProlificIntegrationsForSpace.refetch()
          setShowDeleteConfirmation(false)
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Something went wrong while deleting the prolific integration.",
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
          <DropdownMenuItem onClick={() => setShowDeleteConfirmation(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AreYouSure
        confirmationMessage="Deleting this prolific integration will make it unusable."
        variant="destructive"
        handleConfirm={handleDelete}
        open={showDeleteConfirmation}
        setOpen={setShowDeleteConfirmation}
        isLoading={deleteMutation.isLoading}
      />
    </>
  )
}
