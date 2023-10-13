"use client"

import ErrorMessage from "./error-message"
import QueryDataLoader from "./query-data-loader"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { ColumnDef, Table as TableType, flexRender } from "@tanstack/react-table"
import { UseTRPCQueryResult } from "@trpc/react-query/shared"

interface Props<TData, TValue> {
  table: TableType<TData>
  handleRowClick?: (row: TData) => void
  columns: ColumnDef<TData, TValue>[]
  pageSize?: number
  queryResults: UseTRPCQueryResult<TData[], any> | UseTRPCQueryResult<{ items: TData[]; total: number }, any>
}

export function DataTable<TData, TValue>({ ...props }: Props<TData, TValue>) {
  const { table, handleRowClick, columns, pageSize, queryResults } = props

  return (
    <div className={cn("rounded-md border")}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          <QueryDataLoader
            queryResults={queryResults}
            skeletonItems={pageSize ?? 3}
            addSkeletonContainer={false}
            forceState={!queryResults.isFetching && table.getRowModel().rows.length === 0 ? "empty" : undefined}
          >
            <QueryDataLoader.IsError>
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <div className="flex justify-center py-10">
                    <ErrorMessage message={queryResults.error?.message ?? "Failed to fetch data"} />
                  </div>
                </TableCell>
              </TableRow>
            </QueryDataLoader.IsError>
            <QueryDataLoader.IsLoading>
              <TableRow className="w-full animate-pulse">
                {table.getAllColumns().map((column) => (
                  <TableCell key={column.id + "skeleton-loader-cell"}>
                    <div className="my-1 flex h-6 w-full rounded bg-muted" />
                  </TableCell>
                ))}
              </TableRow>
            </QueryDataLoader.IsLoading>
            <QueryDataLoader.IsEmpty>
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            </QueryDataLoader.IsEmpty>
            <QueryDataLoader.IsSuccess>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => handleRowClick && handleRowClick(row.original)}
                  className={cn(handleRowClick !== undefined && "cursor-pointer")}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))}
            </QueryDataLoader.IsSuccess>
          </QueryDataLoader>
        </TableBody>
      </Table>
    </div>
  )
}
