import { PlusIcon } from "lucide-react"
import { useState } from "react"

import { columns } from "@/components/rating-tags/rating-tags.columns"
import { OrgAdminLayout } from "@/components/spaces/settings/space-admin-layout"
import { ClientDataTable } from "@/components/ui/client-data-table"
import { DataTable } from "@/components/ui/data-table"
import { SearchInput } from "@/components/ui/search-input"
import { SectionHeader } from "@/components/ui/section-header"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { energizeEngine } from "@/lib/energize-engine"
import useDebounce from "@/lib/use-debounce"
import useQueryState from "@/lib/use-query-state"
import { useRouter } from "next/router"

const OrgRatingTagsPage = () => {
  const [filter, setFilter] = useQueryState<"helpful" | "not_helpful">("filter", {
    defaultValue: "helpful",
  })
  const filterQuery = useDebounce(filter, 100)
  const { space_id } = useRouter().query

  const [newTagValue, setNewTagValue] = useState<string>("")

  const tags = energizeEngine.ratingTags.getRatingTags.useQuery({
    spaceId: space_id as string,
    ratingFilter: filterQuery,
  })

  const { toast } = useToast()

  const createTagMutation = energizeEngine.ratingTags.createRatingTag.useMutation()
  const handleCreateTag = async () => {
    if (createTagMutation.isLoading) return

    createTagMutation.mutate(
      {
        spaceId: space_id as string,
        value: newTagValue,
        rating: filter,
      },
      {
        onSuccess: async () => {
          await tags.refetch()
          toast({
            title: "Rating tag created",
            description: "The rating tag was created successfully.",
            variant: "success",
          })
          setNewTagValue("")
        },
        onError: (e) => {
          toast({
            title: "Error creating rating tag",
            description: e.message,
            variant: "destructive",
          })
        },
      },
    )
  }

  return (
    <OrgAdminLayout>
      <div className="flex flex-col gap-4">
        <SectionHeader title="Rating Tags" description="Manage the rating tags in your space.">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as "helpful" | "not_helpful")}>
            <TabsList>
              <TabsTrigger className="w-36" value="helpful">
                Helpful
              </TabsTrigger>
              <TabsTrigger className="w-36" value="not_helpful">
                Not Helpful
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </SectionHeader>
        <Separator />
        <SearchInput
          placeholder={`Add a new ${filter.replaceAll("_", " ")} rating tag...`}
          className="w-full max-w-none"
          value={newTagValue}
          kbd="Enter"
          onChange={(e) => setNewTagValue(e.target.value)}
          isLoading={createTagMutation.isLoading}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleCreateTag()
            }
          }}
          customIcon={<PlusIcon className="h-5 w-5" />}
        />
        <ClientDataTable columns={columns} queryResults={tags} />
      </div>
    </OrgAdminLayout>
  )
}

export default OrgRatingTagsPage
