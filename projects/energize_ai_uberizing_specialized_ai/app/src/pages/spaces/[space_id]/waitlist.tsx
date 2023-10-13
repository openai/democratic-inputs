import { OrgAdminLayout } from "@/components/spaces/settings/space-admin-layout"
import { SearchInput } from "@/components/ui/search-input"
import { SectionHeader } from "@/components/ui/section-header"
import { Separator } from "@/components/ui/separator"
import { ServerDataTable } from "@/components/ui/server-data-table"
import { AddToWaitlist } from "@/components/waitlist/add-to-waitlist"
import { columns } from "@/components/waitlist/waitlist.columns."
import { energizeEngine } from "@/lib/energize-engine"
import usePaginatedTableState from "@/lib/use-paginated-table-state"
import { useRouter } from "next/router"

const WaitlistPage = () => {
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
  const waitlists = energizeEngine.waitlists.getWaitlistEntries.useQuery({
    spaceId: space_id as string,
    search: debouncedSearch ?? null,
    offset: debouncedPageIndex * debouncedPageSize,
    limit: debouncedPageSize,
  })

  return (
    <OrgAdminLayout>
      <div className="flex flex-col gap-4">
        <SectionHeader title="Waitlist" description="Check out your waitlist."></SectionHeader>
        <Separator />
        <div className="flex justify-between">
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} />
          <AddToWaitlist />
        </div>
        <ServerDataTable
          columns={columns}
          queryResults={waitlists}
          setPagination={setPagination}
          pageIndex={pageIndex}
          pageSize={pageSize}
        />
      </div>
    </OrgAdminLayout>
  )
}

export default WaitlistPage
