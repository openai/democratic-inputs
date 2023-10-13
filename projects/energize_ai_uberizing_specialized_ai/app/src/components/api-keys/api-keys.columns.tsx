"use client"

import { DataTableDateCell } from "../ui/data-table-date-cell"
import { ApiKeyActions } from "./api-keys.actions"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { cn, toTitleCase } from "@/lib/utils"
import { EnergizeEngineOutputs } from "@energizeai/engine"
import { ColumnDef } from "@tanstack/react-table"

type RowDataType = EnergizeEngineOutputs["apiKeys"]["getApiKeys"][number]

export const columns: ColumnDef<RowDataType>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
  },
  {
    accessorKey: "safe_key",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Key" />,
  },
  {
    accessorKey: "permissions",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Permissions" />,
    cell: ({ row }) => {
      return (
        <div
          className={cn(
            "flex h-8 w-36 items-center justify-center rounded text-xs font-medium",
            row.original.permissions === "owner" && "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
            row.original.permissions === "write" &&
              "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
            row.original.permissions === "read" && "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
          )}
        >
          {toTitleCase(row.original.permissions)}
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
    cell: ({ row }) => <DataTableDateCell date={row.original.createdAt} />,
    enableSorting: false,
  },
  {
    accessorKey: "expirationDate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Expiration Date" />,
    cell: ({ row }) => <DataTableDateCell date={row.original.expirationDate} />,
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <ApiKeyActions entry={row.original} />
    },
  },
]
