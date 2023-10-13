"use client"

import { CopyIcon, MoreHorizontal, Trash } from "lucide-react"

import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { UserProfileName } from "../ui/user-profile-name"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { energizeEngine } from "@/lib/energize-engine"
import { DEFAULT_SPACE_ID } from "@/lib/spaces"
import { EnergizeEngineOutputs } from "@energizeai/engine"
import { ColumnDef } from "@tanstack/react-table"

type RowDataType = EnergizeEngineOutputs["prompts"]["getPrompts"][number]

export const columns: ColumnDef<RowDataType>[] = [
  {
    id: "picture",
    header: "Author",
    cell: ({ row }) => {
      return (
        <UserProfileName
          data={{
            firstName: row.original.firstName ?? undefined,
            lastName: row.original.lastName ?? undefined,
            imageUrl: row.original.profileImageURL ?? undefined,
            username: row.original.username ?? undefined,
          }}
        />
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "value",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Prompt" />,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const entry = row.original

      const deleteMutation = energizeEngine.prompts.hardDeletePrompt.useMutation()

      const utils = energizeEngine.useContext()

      const handleDelete = async () => {
        await deleteMutation.mutateAsync({
          spaceId: DEFAULT_SPACE_ID,
          promptId: entry.id,
        })

        utils.prompts.getPrompts.refetch()
      }

      return (
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
              Copy prompt
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete}>
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
