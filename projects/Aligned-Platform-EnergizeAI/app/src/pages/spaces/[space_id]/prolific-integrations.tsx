import { RefreshCcw } from "lucide-react"

import { CreateProlificIntegration } from "@/components/prolific/create-prolific-integration"
import { columns } from "@/components/prolific/prolific-integrations.columns"
import { OrgAdminLayout } from "@/components/spaces/settings/space-admin-layout"
import { ClientDataTable } from "@/components/ui/client-data-table"
import { SectionHeader } from "@/components/ui/section-header"
import { Separator } from "@/components/ui/separator"
import { energizeEngine } from "@/lib/energize-engine"
import { useRouter } from "next/router"

const OrgProlificIntegrationsPage = () => {
  const { space_id } = useRouter().query
  const integrations = energizeEngine.prolific.getProlificIntegrationsForSpace.useQuery({
    spaceId: space_id as string,
  })

  return (
    <OrgAdminLayout>
      <div className="flex flex-col gap-4">
        <SectionHeader title="Prolific Integrations" description="Integrate your prolific studies with your space.">
          <CreateProlificIntegration />
        </SectionHeader>
        <Separator />
        <ClientDataTable columns={columns} queryResults={integrations} />
      </div>
    </OrgAdminLayout>
  )
}

export default OrgProlificIntegrationsPage
