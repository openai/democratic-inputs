"use client"

import { MoreHorizontal } from "lucide-react"

import { Button } from "../ui/button"
import { DataTableCopyCell } from "../ui/data-table-copy-cell"
import { DataTableDateCell } from "../ui/data-table-date-cell"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { SmallSpinner } from "../ui/small-spinner"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { energizeEngine } from "@/lib/energize-engine"
import { DEFAULT_SPACE_ID } from "@/lib/spaces"
import { EnergizeEngineOutputs } from "@energizeai/engine"
import { ColumnDef } from "@tanstack/react-table"

type RowDataType = EnergizeEngineOutputs["waitlists"]["getWaitlistEntries"]["items"][number]

export const columns: ColumnDef<RowDataType>[] = [
  {
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    enableSorting: false,
    cell: ({ row }) => {
      return <DataTableCopyCell value={row.original.email} />
    },
  },
  {
    id: "name",
    header: "Name",
    cell: ({ row }) => {
      const entry = row.original
      if (!entry.firstName && !entry.lastName) {
        return <span className="text-muted-foreground">NA</span>
      }
      return `${entry.firstName} ${entry.lastName}`
    },
  },
  {
    accessorKey: "answer",
    header: "Answer",
    cell: ({ row }) => {
      const entry = row.original
      if (!entry.answer) {
        return <span className="text-muted-foreground">NA</span>
      }
      return `${entry.answer}`
    },
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => {
      const entry = row.original
      if (!entry.source) {
        return <span className="text-muted-foreground">NA</span>
      }
      return `${entry.source}`
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
    cell: ({ row }) => <DataTableDateCell date={row.original.createdAt} />,
    enableSorting: false,
  },
  {
    accessorKey: "approvedAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Approved At" />,
    cell: ({ row }) => <DataTableDateCell date={row.original.approvedAt} />,
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const entry = row.original

      const updateMutation = energizeEngine.waitlists.updateWaitlistEntry.useMutation()
      const deleteMutation = energizeEngine.waitlists.deleteWaitlistEntry.useMutation()

      const utils = energizeEngine.useContext()

      const handleUpdate = async () => {
        await updateMutation.mutateAsync({
          spaceId: DEFAULT_SPACE_ID,
          id: entry.id,
          approvedAt: entry.approvedAt ? null : new Date(),
        })

        utils.waitlists.getWaitlistEntries.invalidate()
      }

      const handleDelete = async () => {
        await deleteMutation.mutateAsync({
          spaceId: DEFAULT_SPACE_ID,
          id: entry.id,
        })

        utils.waitlists.getWaitlistEntries.invalidate()
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(entry.email)}>Copy email</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleUpdate}>
              {entry.approvedAt ? "Unapprove" : "Approve"}
              {updateMutation.isLoading && <SmallSpinner className="ml-2" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete}>
              Delete
              {deleteMutation.isLoading && <SmallSpinner className="ml-2" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
