import { RefreshCcw } from "lucide-react"

import { columns } from "@/components/prolific/prolific.columns"
import { OrgAdminLayout } from "@/components/spaces/settings/space-admin-layout"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { SearchInput } from "@/components/ui/search-input"
import { SectionHeader } from "@/components/ui/section-header"
import { Separator } from "@/components/ui/separator"
import { ServerDataTable } from "@/components/ui/server-data-table"
import { SmallSpinner } from "@/components/ui/small-spinner"
import { energizeEngine } from "@/lib/energize-engine"
import usePaginatedTableState from "@/lib/use-paginated-table-state"
import { useRouter } from "next/router"

const OrgProlificPage = () => {
  const {
    search,
    setSearch,
    setPagination,
    debouncedSearch,
    pageSize,
    pageIndex,
    debouncedPageIndex,
    debouncedPageSize,
  } = usePaginatedTableState()

  const { space_id } = useRouter().query
  const identifiers = energizeEngine.prolific.getProlificIdentifiersWithContributionCounts.useQuery({
    spaceId: space_id as string,
    search: debouncedSearch,
    offset: debouncedPageIndex * debouncedPageSize,
    limit: debouncedPageSize,
  })

  return (
    <OrgAdminLayout>
      <div className="flex flex-col gap-4">
        <SectionHeader title="Prolific" description="Moderate the latest prolific usage in your space." />
        <Separator />
        <div className="flex justify-between">
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} />
          {!identifiers.isLoading && (
            <Button
              variant={"ghost"}
              onClick={() => {
                identifiers.refetch()
              }}
            >
              Refresh
              {identifiers.isFetching ? <SmallSpinner className="ml-2" /> : <RefreshCcw className="ml-2 h-4 w-4" />}
            </Button>
          )}
        </div>
        <ServerDataTable
          columns={columns}
          queryResults={identifiers}
          pageIndex={pageIndex}
          pageSize={pageSize}
          setPagination={setPagination}
        />
      </div>
    </OrgAdminLayout>
  )
}

export default OrgProlificPage
