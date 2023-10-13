import { useCallback, useState } from "react"

import useDebounce from "./use-debounce"
import { PaginationState } from "@tanstack/react-table"
import { usePathname, useSearchParams } from "next/navigation"
import { useRouter } from "next/router"

export default function usePaginatedTableState() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [search, setSearchState] = useState<string | undefined>(searchParams.get("search") ?? undefined)
  const debouncedSearch = useDebounce(search, 500)

  const size = searchParams.get("size") ?? "10"
  const [pageSize, setPageSize] = useState<number>(size && !isNaN(parseInt(size)) ? parseInt(size) : 10)

  const page = searchParams.get("page")
  const [pageIndex, setPageIndex] = useState<number>(
    Math.max(page && !isNaN(parseInt(page)) ? parseInt(page) - 1 : 0, 0),
  )

  const debouncedPageIndex = useDebounce(pageIndex, 500)
  const debouncedPageSize = useDebounce(pageSize, 500)

  // Create query string
  const createQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString())

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key)
        } else {
          newSearchParams.set(key, String(value))
        }
      }

      return newSearchParams.toString()
    },
    [searchParams],
  )

  const setPagination = (v: PaginationState) => {
    if (v.pageIndex === pageIndex && v.pageSize === pageSize) {
      return
    }

    if (v.pageSize === pageSize) {
      setPageIndex(v.pageIndex)
    } else {
      setPageIndex(0)
    }
    setPageSize(v.pageSize)

    router.push(
      `${pathname}?${createQueryString({
        page: v.pageSize === pageSize ? v.pageIndex + 1 : 1,
        size: v.pageSize,
      })}`,
    )
  }

  const setSearch = (v: string) => {
    setPageIndex(0)
    setSearchState(v)

    router.push(
      `${pathname}?${createQueryString({
        search: v,
        page: 1,
      })}`,
    )
  }

  return {
    search,
    setSearch,
    debouncedSearch,
    pageIndex,
    setPagination,
    debouncedPageIndex,
    pageSize,
    debouncedPageSize,
  }
}
