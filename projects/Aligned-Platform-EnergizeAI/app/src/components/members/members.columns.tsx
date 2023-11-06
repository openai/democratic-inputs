"use client"

import { CheckCircle } from "lucide-react"

import { UserRoleCell } from "../roles/user-role-cell"
import { DataTableDateCell } from "../ui/data-table-date-cell"
import { UserProfileName } from "../ui/user-profile-name"
import { ApproveWaitlistButton } from "../waitlist/approve-waitlist-button"
import { MembersActions } from "./members.actions"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { EnergizeEngineOutputs } from "@energizeai/engine"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { ColumnDef } from "@tanstack/react-table"

type RowDataType = EnergizeEngineOutputs["roles"]["getRolesInSpaceWithContributionCounts"]["items"][number]

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
    accessorKey: "roleId",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
    cell: ({ row }) => <UserRoleCell userId={row.original.userId} />,
    enableSorting: false,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
    cell: ({ row }) => <DataTableDateCell date={row.original.createdAt} />,
    enableSorting: false,
  },
  {
    id: "approve",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Waitlist" />,
    cell: ({ row }) => {
      const entry = row.original
      return <ApproveWaitlistButton isApproved={entry.isApprovedOnWaitlist ?? false} userId={entry.userId} />
    },
  },
  {
    id: "tos",
    header: ({ column }) => <DataTableColumnHeader column={column} title="TOS" />,
    cell: ({ row }) => {
      return row.original.completedInstructions ? (
        <CheckCircle className="ml-1 h-4 w-4 text-green-500" />
      ) : (
        <XMarkIcon className="ml-1 h-4 w-4 text-red-500" />
      )
    },
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
  {
    id: "actions",
    cell: ({ row }) => {
      return <MembersActions userId={row.original.userId} />
    },
  },
]
