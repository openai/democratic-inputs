import { columns } from "@/components/members/members.columns"
import { OrgAdminLayout } from "@/components/spaces/settings/space-admin-layout"
import { DataTable } from "@/components/ui/data-table"
import { SearchInput } from "@/components/ui/search-input"
import { SectionHeader } from "@/components/ui/section-header"
import { Separator } from "@/components/ui/separator"
import { ServerDataTable } from "@/components/ui/server-data-table"
import { energizeEngine } from "@/lib/energize-engine"
import usePaginatedTableState from "@/lib/use-paginated-table-state"
import { useRouter } from "next/router"

const OrgMembersPage = () => {
  const { space_id } = useRouter().query
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

  const roles = energizeEngine.roles.getRolesInSpaceWithContributionCounts.useQuery({
    spaceId: space_id as string,
    search: debouncedSearch,
    offset: debouncedPageIndex * debouncedPageSize,
    limit: debouncedPageSize,
  })

  return (
    <OrgAdminLayout>
      <div className="flex flex-col gap-4">
        <SectionHeader title="Members" description="Check out the members of your space.">
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} />
        </SectionHeader>
        <Separator />
        <ServerDataTable
          columns={columns}
          queryResults={roles}
          pageIndex={pageIndex}
          pageSize={pageSize}
          setPagination={setPagination}
        />
      </div>
    </OrgAdminLayout>
  )
}

export default OrgMembersPage
