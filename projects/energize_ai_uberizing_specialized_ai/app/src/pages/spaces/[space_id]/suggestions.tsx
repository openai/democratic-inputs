import { OrgAdminLayout } from "@/components/spaces/settings/space-admin-layout"
import { TopicSuggestionCard } from "@/components/topic-suggestions/topic-suggestion-card"
import { SkeletonTopicCard } from "@/components/topics/skeleton-topic-card"
import QueryDataLoader from "@/components/ui/query-data-loader"
import { SearchInput } from "@/components/ui/search-input"
import { energizeEngine } from "@/lib/energize-engine"
import useDebounce from "@/lib/use-debounce"
import useQueryState from "@/lib/use-query-state"
import { useRouter } from "next/router"

const SpaceSuggestions = () => {
  const { space_id } = useRouter().query
  const [search, setSearch] = useQueryState<string | undefined>("search", {
    defaultValue: undefined,
  })
  const searchQuery = useDebounce(search, 500)

  const topicSuggestionsQuery = energizeEngine.topicSuggestions.getTopicSuggestions.useQuery({
    spaceId: space_id as string,
    search: searchQuery ?? null,
  })

  return (
    <OrgAdminLayout>
      <div className="flex flex-col gap-4">
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} />
        <QueryDataLoader queryResults={topicSuggestionsQuery} skeletonItems={4}>
          <QueryDataLoader.IsSuccess>
            <div className="flex flex-col gap-4">
              {topicSuggestionsQuery.data?.map((topic) => (
                <TopicSuggestionCard key={topic.id} topicSuggestion={topic} />
              ))}
            </div>
          </QueryDataLoader.IsSuccess>
          <QueryDataLoader.IsLoading>
            <SkeletonTopicCard />
          </QueryDataLoader.IsLoading>
        </QueryDataLoader>
      </div>
    </OrgAdminLayout>
  )
}

export default SpaceSuggestions
