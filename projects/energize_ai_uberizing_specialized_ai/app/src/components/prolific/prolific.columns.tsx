"use client"

import { DataTableCopyCell } from "../ui/data-table-copy-cell"
import { DataTableDateCell } from "../ui/data-table-date-cell"
import { UserProfileName } from "../ui/user-profile-name"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { EnergizeEngineOutputs } from "@energizeai/engine"
import { ColumnDef } from "@tanstack/react-table"

type RowDataType = EnergizeEngineOutputs["prolific"]["getProlificIdentifiersWithContributionCounts"]["items"][number]

export const columns: ColumnDef<RowDataType>[] = [
  {
    id: "picture",
    header: "User",
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
    accessorKey: "prolificPid",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Prolific ID" />,
    enableSorting: false,
    cell: ({ row }) => {
      return <DataTableCopyCell value={row.original.prolificPid} />
    },
  },
  {
    accessorKey: "studyId",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Study ID" />,
    enableSorting: false,
    cell: ({ row }) => {
      return <DataTableCopyCell value={row.original.studyId} />
    },
  },
  {
    accessorKey: "sessionId",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Session ID" />,
    enableSorting: false,
    cell: ({ row }) => {
      return <DataTableCopyCell value={row.original.sessionId} />
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
    cell: ({ row }) => <DataTableDateCell date={row.original.createdAt} />,
    enableSorting: false,
  },
  {
    accessorKey: "ratingsCount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ratings" align="right" />,
    cell: ({ row }) => <div className="text-right">{row.original.ratingsCount}</div>,
    enableSorting: false,
  },
  {
    accessorKey: "guidelinesCount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Proposals" align="right" />,
    cell: ({ row }) => <div className="text-right">{row.original.guidelinesCount}</div>,
    enableSorting: false,
  },
]
