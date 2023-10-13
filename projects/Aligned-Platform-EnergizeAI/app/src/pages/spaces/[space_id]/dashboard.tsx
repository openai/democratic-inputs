import { TrendingPoints } from "@/components/guidelines/trending-points"
import { KeyData } from "@/components/spaces/dashboard/key-data"
import { ReportsWidget } from "@/components/spaces/dashboard/reports-widget"
import { TopContributors } from "@/components/spaces/dashboard/top-contributors"
import { SectionHeader } from "@/components/ui/section-header"
import { Separator } from "@/components/ui/separator"

const OrgOverviewPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <SectionHeader title="Dashboard" description="Explore the latest topics and contributions." />
      <Separator />
      <div className="flex gap-4">
        <div className="flex h-full w-2/3 flex-col">
          <div className="flex h-full flex-col">
            <ReportsWidget />
          </div>
        </div>
        <div className="flex h-full w-1/3 flex-col gap-4">
          <KeyData />
          <TopContributors />
        </div>
      </div>
      <TrendingPoints />
    </div>
  )
}

export default OrgOverviewPage
