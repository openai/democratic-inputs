import { Row, Table } from "@tanstack/react-table"

export interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export type MobileRowProps<TData> = {
  row: Row<TData>
  handleRowClick?: (row: TData) => void
}

export type DataTableData<TData> =
  | TData[]
  | {
      items: TData[]
      total: number
    }
