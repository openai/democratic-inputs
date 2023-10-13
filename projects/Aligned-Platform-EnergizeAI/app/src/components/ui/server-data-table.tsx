"use client"

import { useEffect, useMemo, useState } from "react"

import { DataTable } from "./data-table"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbarProps } from "@/types/data-table-types"
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { UseTRPCQueryResult } from "@trpc/react-query/shared"

type ServerQueryResult<TData> = { items: TData[]; total: number }

type Props<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  toolbar?: (props: DataTableToolbarProps<TData>) => JSX.Element
  handleRowClick?: (row: TData) => void
  pageSize: number
  queryResults: UseTRPCQueryResult<ServerQueryResult<TData>, any>
  pageIndex: number
  setPagination: (v: PaginationState) => void
}

export function ServerDataTable<TData, TValue>({ ...props }: Props<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const { columns, toolbar, queryResults, handleRowClick, pageIndex, pageSize } = props

  const data = props.queryResults.data?.items ?? []
  const totalItems = props.queryResults.data?.total ?? 0

  const [paginationInternal, setPaginationInternal] = useState<PaginationState>({
    pageIndex: pageIndex,
    pageSize: pageSize,
  })

  useEffect(() => {
    props.setPagination(paginationInternal)
  }, [paginationInternal])

  const pagination = useMemo(() => {
    return {
      pageIndex: pageIndex,
      pageSize: pageSize,
    }
  }, [pageIndex, pageSize])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    pageCount: Math.ceil((totalItems ?? 0) / (pagination?.pageSize ?? 10)),
    manualPagination: true,
    onPaginationChange: setPaginationInternal,
  })

  return (
    <div>
      {toolbar && <div className="mb-4 flex w-full">{toolbar({ table })}</div>}
      <DataTable
        queryResults={queryResults}
        table={table}
        handleRowClick={handleRowClick}
        columns={columns}
        pageSize={pageSize}
      />
      <DataTablePagination table={table} isLoading={queryResults.isLoading} />
    </div>
  )
}
