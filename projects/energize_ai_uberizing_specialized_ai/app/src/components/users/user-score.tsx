import QueryDataLoader from "../ui/query-data-loader"
import { Skeleton } from "../ui/skeleton"
import { energizeEngine } from "@/lib/energize-engine"
import { cn } from "@/lib/utils"
import { useUser } from "@clerk/clerk-react"
import { useRouter } from "next/router"

type Props = {
  className?: string
}

export const UserScore = ({ className }: Props) => {
  const { user } = useUser()
  const userScoreQuery = energizeEngine.users.getUserScore.useQuery(undefined, {
    enabled: !!user,
  })

  return (
    <QueryDataLoader queryResults={userScoreQuery} skeletonItems={1}>
      <QueryDataLoader.IsLoading>
        <Skeleton className="h-5 w-20" />
      </QueryDataLoader.IsLoading>
      <QueryDataLoader.IsSuccess>
        <div className={cn("flex items-center gap-1 whitespace-nowrap", className)}>
          <span>🔥</span>
          {`
            ${
              parseInt((userScoreQuery.data?.score.authored_guidelines_count ?? 0).toString()) +
              parseInt((userScoreQuery.data?.score.helpful_ratings_count ?? 0).toString())
            }
            `}{" "}
        </div>
      </QueryDataLoader.IsSuccess>
    </QueryDataLoader>
  )
}
