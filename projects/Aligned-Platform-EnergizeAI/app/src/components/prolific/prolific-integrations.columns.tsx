"use client"

import { DataTableCopyCell } from "../ui/data-table-copy-cell"
import { DataTableDateCell } from "../ui/data-table-date-cell"
import { ProlificIntegrationActions } from "./prolific-integrations.actions"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { truncate } from "@/lib/utils"
import { EnergizeEngineOutputs } from "@energizeai/engine"
import { ColumnDef } from "@tanstack/react-table"

type RowDataType = EnergizeEngineOutputs["prolific"]["getProlificIntegrationsForSpace"][number]

export const columns: ColumnDef<RowDataType>[] = [
  {
    accessorKey: "studyId",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Study ID" />,
    enableSorting: false,
    cell: ({ row }) => {
      return <DataTableCopyCell value={row.original.studyId} />
    },
  },
  {
    accessorKey: "completionCode",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Completion Code" />,
    enableSorting: false,
    cell: ({ row }) => {
      return <DataTableCopyCell value={row.original.completionCode} />
    },
  },
  {
    accessorKey: "accessToken",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Study URL" />,
    enableSorting: false,
    cell: ({ row }) => {
      const studyURL = `https://app.energize.ai/prolific/${row.original.spaceId}?ACCESS_TOKEN=${row.original.accessToken}&PROLIFIC_PID={{%PROLIFIC_PID%}}&STUDY_ID={{%STUDY_ID%}}&SESSION_ID={{%SESSION_ID%}}`
      return <DataTableCopyCell value={studyURL} text={truncate(studyURL, 50)} />
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
    cell: ({ row }) => <DataTableDateCell date={row.original.createdAt} />,
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <ProlificIntegrationActions entry={row.original} />
    },
  },
]
