import { useState } from "react"

import { ContributionsLayout } from "@/components/contributions/layout"
import { TopicTreeMenu } from "@/components/topics/topic-tree-menu"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import QueryDataLoader from "@/components/ui/query-data-loader"
import { SearchInput } from "@/components/ui/search-input"
import { SectionHeader } from "@/components/ui/section-header"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { SmallSpinner } from "@/components/ui/small-spinner"
import { energizeEngine } from "@/lib/energize-engine"
import { Paths, SEARCH_PARAM_KEYS } from "@/lib/paths"
import useDebounce from "@/lib/use-debounce"
import useQueryState from "@/lib/use-query-state"
import { cn } from "@/lib/utils"
import { useRouter } from "next/router"

const MyRatingsPage = () => {
  const { space_id } = useRouter().query
  const [topicId, setTopicId] = useState<string | null>(null)
  const [search, setSearch] = useQueryState<string | undefined>("search", {
    defaultValue: undefined,
  })
  const searchQuery = useDebounce(search, 500)

  const ratings = energizeEngine.ratings.getMyRatingsHistory.useInfiniteQuery(
    {
      spaceId: space_id as string,
      filter: null,
      topicId: topicId as string,
      search: searchQuery ?? null,
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  )

  const ratingTagAssignments = energizeEngine.ratingTags.getAssignedTagsForRatingsMap.useQuery(
    {
      spaceId: space_id as string,
      ratingIds: ratings.data?.pages.map((page) => page.items.map((item) => item.id)).flat() ?? [],
    },
    { enabled: ratings.data !== undefined },
  )

  const router = useRouter()
  const handleGoToGuideline = (guidelineId: string, topicId: string) => {
    const url = new URL(`/spaces/${space_id}`, window.location.href)

    url.searchParams.set(SEARCH_PARAM_KEYS[Paths.Playground].guidelineId, guidelineId)
    url.searchParams.set(SEARCH_PARAM_KEYS[Paths.Playground].topicId, topicId)

    router.push(url)
  }

  const cards = ratings.data
    ? ratings.data.pages
        .map((page) => page.items)
        .flat()
        .map((r) => (
          <Card
            className="w-full cursor-pointer hover:border-primary"
            key={r.id}
            onClick={() => {
              handleGoToGuideline(r.guidelineId, r.topic.id)
            }}
          >
            <CardHeader className="flex flex-row justify-between">
              <div className="flex flex-col gap-2">
                <CardTitle>{r.topic.title}</CardTitle>
                <CardDescription>Created at: {r.createdAt.toLocaleDateString()}</CardDescription>
              </div>
              {r.rating === "helpful" ? (
                <div
                  className={cn(
                    "flex h-8 w-36 items-center justify-center rounded bg-green-100 text-sm text-xs font-medium text-success",
                    "dark:bg-green-900 dark:text-green-200",
                  )}
                >
                  Helpful
                </div>
              ) : (
                <div
                  className={cn(
                    "flex h-8 w-36 items-center justify-center rounded bg-red-100 text-sm text-xs font-medium text-destructive",
                    "dark:bg-red-900 dark:text-red-200",
                  )}
                >
                  Not Helpful
                </div>
              )}
            </CardHeader>
            <CardContent>
              {r.guidelines.value}
              <div className="mt-4 flex gap-2">
                <QueryDataLoader queryResults={ratingTagAssignments} addSkeletonContainer={false} skeletonItems={1}>
                  <QueryDataLoader.IsSuccess>
                    {ratingTagAssignments.data && ratingTagAssignments.data[r.id]
                      ? ratingTagAssignments.data[r.id].map((rt) => (
                          <div key={rt.id} className="flex h-8 items-center justify-center rounded bg-muted px-2">
                            {rt.value}
                          </div>
                        ))
                      : null}
                  </QueryDataLoader.IsSuccess>
                  <QueryDataLoader.IsLoading>
                    <Skeleton className="h-8 w-20 rounded" />
                    <Skeleton className="h-8 w-20 rounded" />
                    <Skeleton className="h-8 w-20 rounded" />
                  </QueryDataLoader.IsLoading>
                </QueryDataLoader>
              </div>
            </CardContent>
          </Card>
        ))
    : null

  const nextButton = ratings.hasNextPage ? (
    <Button
      variant={"secondary"}
      onClick={() => ratings.fetchNextPage()}
      disabled={ratings.isLoading}
      className="mx-auto w-min whitespace-nowrap"
    >
      Load more
      {ratings.isFetchingNextPage && <SmallSpinner className="ml-2" />}
    </Button>
  ) : null

  return (
    <ContributionsLayout>
      <div className="flex flex-col gap-4">
        <SectionHeader title="Ratings" description="Explore all the ratings you have made">
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
          placeholder="Search by guideline..."
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-none"
        />
        <QueryDataLoader
          forceState={ratings.isSuccess && ratings.data.pages[0].items.length === 0 ? "empty" : undefined}
          queryResults={ratings}
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

export default MyRatingsPage
