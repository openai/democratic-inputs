"use client"

import { DataTableDateCell } from "../ui/data-table-date-cell"
import { RatingTagActions } from "./rating-tags.actions"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { EnergizeEngineOutputs } from "@energizeai/engine"
import { ColumnDef } from "@tanstack/react-table"

type RowDataType = EnergizeEngineOutputs["ratingTags"]["getRatingTags"][number]

export const columns: ColumnDef<RowDataType>[] = [
  {
    accessorKey: "value",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tag" />,
  },
  {
    accessorKey: "rating",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
    cell: ({ row }) => <DataTableDateCell date={row.original.createdAt} />,
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <RatingTagActions entry={row.original} />
    },
  },
]
