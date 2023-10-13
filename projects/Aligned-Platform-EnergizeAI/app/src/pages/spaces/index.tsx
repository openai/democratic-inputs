import { CreateNewSpace } from "@/components/spaces/create-new-space"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import QueryDataLoader from "@/components/ui/query-data-loader"
import { SearchInput } from "@/components/ui/search-input"
import { SectionHeader } from "@/components/ui/section-header"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { SmallSpinner } from "@/components/ui/small-spinner"
import { energizeEngine } from "@/lib/energize-engine"
import useDebounce from "@/lib/use-debounce"
import useQueryState from "@/lib/use-query-state"
import { useRouter } from "next/router"

const MyRatingsPage = () => {
  const [search, setSearch] = useQueryState<string | undefined>("search", {
    defaultValue: undefined,
  })
  const searchQuery = useDebounce(search, 500)

  const ratings = energizeEngine.spaces.getSpaces.useInfiniteQuery(
    {
      search: searchQuery ?? null,
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  )

  const router = useRouter()
  const handleGoToOrg = (space_id: string) => {
    const url = new URL(`/spaces/${space_id}`, window.location.href)
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
              handleGoToOrg(r.id)
            }}
          >
            <CardHeader className="flex flex-row justify-between">
              <div className="flex flex-col gap-2">
                <CardTitle>{r.name}</CardTitle>
                <CardDescription>Created at: {r.createdAt.toLocaleDateString()}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>{r.description}</CardContent>
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
    <div className="flex flex-col gap-4">
      <SectionHeader title="Spaces" description="Explore all the spaces on aligned">
        <CreateNewSpace />
      </SectionHeader>
      <SearchInput
        value={search}
        placeholder="Search by name..."
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
  )
}

export default MyRatingsPage
