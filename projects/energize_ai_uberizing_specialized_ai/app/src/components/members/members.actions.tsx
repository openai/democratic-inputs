import { CopyIcon, MoreHorizontal } from "lucide-react"

import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { useToast } from "../ui/use-toast"

type Props = {
  userId: string
}

export const MembersActions = ({ userId }: Props) => {
  const { toast } = useToast()

  const handleCopyUserId = async () => {
    navigator.clipboard.writeText(userId)
    toast({
      title: "Success",
      description: "User ID copied to clipboard.",
      variant: "success",
    })
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
          <DropdownMenuItem onClick={handleCopyUserId}>
            <CopyIcon className="mr-2 h-4 w-4" />
            Copy User ID
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
