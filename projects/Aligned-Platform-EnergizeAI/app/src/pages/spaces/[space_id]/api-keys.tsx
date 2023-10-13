import { ExternalLinkIcon } from "lucide-react"

import { columns } from "@/components/api-keys/api-keys.columns"
import { CreateApiKey } from "@/components/api-keys/create-api-key"
import { OrgAdminLayout } from "@/components/spaces/settings/space-admin-layout"
import { Button } from "@/components/ui/button"
import { ClientDataTable } from "@/components/ui/client-data-table"
import { DataTable } from "@/components/ui/data-table"
import { SearchInput } from "@/components/ui/search-input"
import { SectionHeader } from "@/components/ui/section-header"
import { Separator } from "@/components/ui/separator"
import { energizeEngine, getBaseEnergizeEngineUrl } from "@/lib/energize-engine"
import useDebounce from "@/lib/use-debounce"
import useQueryState from "@/lib/use-query-state"
import Link from "next/link"
import { useRouter } from "next/router"

const OrgApiKeysPage = () => {
  const [search, setSearch] = useQueryState<string | undefined>("search", {
    defaultValue: undefined,
  })
  const searchQuery = useDebounce(search, 500)
  const { space_id } = useRouter().query
  const apiKeys = energizeEngine.apiKeys.getApiKeys.useQuery({
    spaceId: space_id as string,
    search: searchQuery || undefined,
  })

  return (
    <OrgAdminLayout>
      <div className="flex flex-col gap-4">
        <SectionHeader title="API Keys" description="Manage your space's API keys. Be extremely careful with these.">
          <Link href={`${getBaseEnergizeEngineUrl()}/docs`} passHref target="_blank">
            <Button variant={"link"} className="px-0">
              <ExternalLinkIcon className="mr-2 h-4 w-4" />
              API Documentation
            </Button>
          </Link>
        </SectionHeader>
        <Separator />
        <div className="flex justify-between">
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} />
          <CreateApiKey />
        </div>
        <ClientDataTable columns={columns} queryResults={apiKeys} />
      </div>
    </OrgAdminLayout>
  )
}

export default OrgApiKeysPage
