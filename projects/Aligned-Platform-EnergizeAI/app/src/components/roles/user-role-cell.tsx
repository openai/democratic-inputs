import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Skeleton } from "../ui/skeleton"
import { SmallSpinner } from "../ui/small-spinner"
import { useToast } from "../ui/use-toast"
import { energizeEngine } from "@/lib/energize-engine"
import { cn } from "@/lib/utils"
import { useAuth } from "@clerk/clerk-react"
import { EnergizeEngineOutputs } from "@energizeai/engine"
import { useRouter } from "next/router"

type Props = {
  userId: string
  className?: string
}

export const UserRoleCell = ({ userId }: Props) => {
  const { toast } = useToast()
  const { space_id } = useRouter().query

  const roleQuery = energizeEngine.roles.getRoleForUserInSpace.useQuery(
    {
      spaceId: space_id as string,
      userId,
    },
    {
      retry: false,
    },
  )

  const updateMutation = energizeEngine.roles.setRoleForUserInSpace.useMutation()
  const { userId: currentUserID } = useAuth()

  type Role = EnergizeEngineOutputs["roles"]["getRoleInSpace"]
  const handleUpdate = async (roleName: Role["name"]) => {
    if (userId === currentUserID) {
      toast({
        title: "Error updating role",
        description: "You cannot update your own role",
        variant: "destructive",
      })
      return
    }

    updateMutation.mutate(
      {
        userId: userId,
        spaceId: space_id as string,
        roleName,
      },
      {
        onSuccess: async () => {
          await roleQuery.refetch()
          toast({
            title: "Role updated",
            description: `The role for this user has been updated to ${roleName}`,
            variant: "success",
          })
        },
        onError: (error) => {
          toast({
            title: "Error updating role",
            description: error.message,
            variant: "destructive",
          })
        },
      },
    )
  }

  if (roleQuery.isLoading) {
    return <Skeleton className="h-8 w-32 rounded-md" />
  }

  if (!roleQuery.data) {
    return (
      <p>
        <span className="text-red-500">ERROR</span>
      </p>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={cn(
            roleQuery.data.name === "admin" && "bg-muted text-foreground hover:bg-muted hover:opacity-80",
            roleQuery.data.name === "member" && "bg-green-100 text-green-800 hover:bg-green-200",
            roleQuery.data.name === "member" && "dark:bg-green-800 dark:text-green-100 hover:dark:bg-green-700",
            roleQuery.data.name === "moderator" && "bg-amber-100 text-amber-800 hover:bg-amber-200",
            roleQuery.data.name === "moderator" && "dark:bg-amber-800 dark:text-amber-100 hover:dark:bg-amber-700",
            "h-8 w-32 rounded-md text-center text-xs font-bold uppercase",
          )}
          disabled={updateMutation.isLoading}
        >
          {roleQuery.data.name}
          {updateMutation.isLoading && <SmallSpinner className="ml-2" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Set as...</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {roleQuery.data.name !== "admin" && (
          <DropdownMenuItem onClick={() => handleUpdate("admin")} disabled={updateMutation.isLoading}>
            Admin
          </DropdownMenuItem>
        )}
        {roleQuery.data.name !== "moderator" && (
          <DropdownMenuItem onClick={() => handleUpdate("moderator")} disabled={updateMutation.isLoading}>
            Moderator
          </DropdownMenuItem>
        )}
        {roleQuery.data.name !== "member" && (
          <DropdownMenuItem onClick={() => handleUpdate("member")} disabled={updateMutation.isLoading}>
            Member
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
