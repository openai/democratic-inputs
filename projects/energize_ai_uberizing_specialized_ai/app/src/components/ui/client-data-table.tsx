"use client"

import { useEffect, useMemo, useState } from "react"

import { Button } from "./button"
import { DataTable } from "./data-table"
import { DataTablePagination } from "./data-table-pagination"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { UseTRPCQueryResult } from "@trpc/react-query/shared"

type Props<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  handleRowClick?: (row: TData) => void
  queryResults: UseTRPCQueryResult<TData[], any>
}

export function ClientDataTable<TData, TValue>({ ...props }: Props<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const { columns, queryResults } = props

  const data = props.queryResults.data ?? []

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div>
      <DataTable table={table} handleRowClick={props.handleRowClick} columns={columns} queryResults={queryResults} />
      {table.getCanPreviousPage() || table.getCanNextPage() ? (
        <div className="flex items-center justify-end space-x-2 pb-8 lg:py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      ) : null}
    </div>
  )
}
