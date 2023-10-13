import { useState } from "react"

import { ContributionsLayout } from "@/components/contributions/layout"
import { TopicTreeMenu } from "@/components/topics/topic-tree-menu"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import QueryDataLoader from "@/components/ui/query-data-loader"
import { SearchInput } from "@/components/ui/search-input"
import { SectionHeader } from "@/components/ui/section-header"
import { Separator } from "@/components/ui/separator"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { SmallSpinner } from "@/components/ui/small-spinner"
import { energizeEngine } from "@/lib/energize-engine"
import { Paths, SEARCH_PARAM_KEYS } from "@/lib/paths"
import useDebounce from "@/lib/use-debounce"
import useQueryState from "@/lib/use-query-state"
import { useRouter } from "next/router"

const MyGuidelinesPage = () => {
  const { space_id } = useRouter().query
  const [topicId, setTopicId] = useState<string | null>(null)
  const [search, setSearch] = useQueryState<string | undefined>("search", {
    defaultValue: undefined,
  })
  const searchQuery = useDebounce(search, 500)

  const guidelines = energizeEngine.guidelines.getMyProposedGuidelines.useInfiniteQuery(
    {
      spaceId: space_id as string,
      topicId: topicId as string,
      search: searchQuery ?? null,
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  )

  const router = useRouter()
  const handleGoToGuideline = (guidelineId: string, topicId: string) => {
    const url = new URL(`/spaces/${space_id}`, window.location.href)

    url.searchParams.set(SEARCH_PARAM_KEYS[Paths.Playground].guidelineId, guidelineId)
    url.searchParams.set(SEARCH_PARAM_KEYS[Paths.Playground].topicId, topicId)

    router.push(url)
  }

  const cards = guidelines.data
    ? guidelines.data.pages
        .map((page) => page.items)
        .flat()
        .map((g) => (
          <Card
            className="w-full cursor-pointer hover:border-primary"
            key={g.id}
            onClick={() => {
              handleGoToGuideline(g.id, g.topic.id)
            }}
          >
            <CardHeader>
              <CardTitle>{g.topic.title}</CardTitle>
              <CardDescription>Created at: {g.createdAt.toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>{g.value}</CardContent>
          </Card>
        ))
    : null

  const nextButton = guidelines.hasNextPage ? (
    <Button
      variant={"secondary"}
      onClick={() => guidelines.fetchNextPage()}
      disabled={guidelines.isLoading}
      className="mx-auto w-min whitespace-nowrap"
    >
      Load more
      {guidelines.isFetchingNextPage && <SmallSpinner className="ml-2" />}
    </Button>
  ) : null

  return (
    <ContributionsLayout>
      <div className="flex flex-col gap-4">
        <SectionHeader title="Guidelines" description="Explore all the guidelines you have proposed">
          <TopicTreeMenu
            currentTopicId={topicId}
            handleNewTopicId={(topicId: string) => {
              setTopicId(topicId)
            }}
            className="max-w-sm flex-1 whitespace-nowrap"
          />
        </SectionHeader>
        <Separator />
        <SearchInput
          value={search}
          placeholder="Search by guideline or topic..."
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-none"
        />
        <QueryDataLoader
          forceState={guidelines.isSuccess && guidelines.data.pages[0].items.length === 0 ? "empty" : undefined}
          queryResults={guidelines}
          skeletonItems={4}
        >
          <QueryDataLoader.IsLoading>
            <SkeletonCard />
          </QueryDataLoader.IsLoading>
          <QueryDataLoader.IsSuccess>{cards}</QueryDataLoader.IsSuccess>
        </QueryDataLoader>
        {nextButton}
      </div>
    </ContributionsLayout>
  )
}

export default MyGuidelinesPage
