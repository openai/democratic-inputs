import { CheckSquareIcon, XIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { SmallSpinner } from "../ui/small-spinner"
import { useToast } from "../ui/use-toast"
import { energizeEngine } from "@/lib/energize-engine"
import { useRouter } from "next/router"

type Props = {
  userId: string
  isApproved: boolean
}

export const ApproveWaitlistButton = ({ userId, isApproved }: Props) => {
  const { space_id } = useRouter().query
  const { toast } = useToast()
  const [optimisticState, setOptimisticState] = useState(isApproved)

  const updateMutation = energizeEngine.waitlists.updateWaitlistEntryForUserId.useMutation()

  const handleUpdate = async () => {
    updateMutation.mutate(
      {
        userId: userId,
        approvedAt: optimisticState ? null : new Date(),
        spaceId: space_id as string,
      },
      {
        onSuccess: async (data) => {
          setOptimisticState(!optimisticState)
          toast({
            title: "Success",
            description: "User has been updated",
            variant: "success",
          })
        },
      },
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {optimisticState ? (
          <Button variant="success" className="ml-2 h-8 w-8 p-0" disabled={updateMutation.isLoading}>
            <span className="sr-only">Open menu</span>
            <CheckSquareIcon className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="destructive" className="ml-2 h-8 w-8 p-0" disabled={updateMutation.isLoading}>
            <span className="sr-only">Open menu</span>
            <XIcon className="h-4 w-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleUpdate}>
          {optimisticState ? "Unapprove" : "Approve"}
          {updateMutation.isLoading && <SmallSpinner className="ml-2" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
