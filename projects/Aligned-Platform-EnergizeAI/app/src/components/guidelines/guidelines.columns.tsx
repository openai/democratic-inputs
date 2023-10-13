"use client"

import { CopyIcon, MoreHorizontal, Trash } from "lucide-react"

import { Button } from "../ui/button"
import { DataTableDateCell } from "../ui/data-table-date-cell"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { energizeEngine } from "@/lib/energize-engine"
import { DEFAULT_SPACE_ID } from "@/lib/spaces"
import { EnergizeEngineOutputs } from "@energizeai/engine"
import { ColumnDef } from "@tanstack/react-table"

type RowDataType = EnergizeEngineOutputs["guidelines"]["getGuidelinesForTopicWithRatingCount"][number]

export const columns: ColumnDef<RowDataType>[] = [
  {
    accessorKey: "value",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Guideline" />,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
    cell: ({ row }) => <DataTableDateCell date={row.original.createdAt} />,
    enableSorting: false,
  },
  {
    accessorKey: "ratingsCount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ratings" align="right" />,
    cell: ({ row }) => <div className="text-right">{row.original.ratingsCount}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const entry = row.original

      const deleteMutation = energizeEngine.guidelines.hardDeleteGuideline.useMutation()

      const utils = energizeEngine.useContext()

      const handleDelete = async () => {
        await deleteMutation.mutateAsync({
          spaceId: DEFAULT_SPACE_ID,
          id: entry.id,
        })

        utils.guidelines.getGuidelinesForTopicWithRatingCount.refetch()
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
