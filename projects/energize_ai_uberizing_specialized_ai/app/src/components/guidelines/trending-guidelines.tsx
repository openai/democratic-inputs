import { UserIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import QueryDataLoader from "../ui/query-data-loader"
import { SkeletonCard } from "../ui/skeleton-card"
import { energizeEngine } from "@/lib/energize-engine"
import { DEFAULT_SPACE_ID } from "@/lib/spaces"
import { truncate } from "@/lib/utils"

type Props = {
  handleGuidelineClick?: (guidelineId: string, topicId: string) => void
}

export const TrendingGuidelines = ({ handleGuidelineClick }: Props) => {
  const guidelinesQuery = energizeEngine.guidelines.getLeafGuidelines.useQuery({
    spaceId: DEFAULT_SPACE_ID,
    topicId: null,
    limit: 3,
  })

  const handleOpen = (guidelineId: string, topicId: string) => {
    if (handleGuidelineClick !== undefined) {
      handleGuidelineClick(guidelineId, topicId)
    }
  }

  const formatGuidelineValue = (value: string) => {
    const parts = value.split(/(\[[^\]]+\])/)
    return (
      <span className="inline">
        {parts.map((part, index) => {
          if (part.startsWith("[") && part.endsWith("]")) {
            return (
              <span key={index} className="block font-semibold">
                {part}
              </span>
            )
          }
          return (
            <span key={index} className="inline">
              {part}
            </span>
          )
        })}
      </span>
    )
  }

  const gradients = [
    "bg-gradient-to-r from-red-300 to-pink-400 dark:from-red-700 dark:to-pink-800",
    "bg-gradient-to-r from-purple-300 to-indigo-400 dark:from-purple-700 dark:to-indigo-800",
    "bg-gradient-to-r from-blue-300 to-green-400 dark:from-blue-700 dark:to-green-800",
    "bg-gradient-to-r from-yellow-300 to-red-400 dark:from-yellow-700 dark:to-red-800",
    "bg-gradient-to-r from-pink-300 to-purple-400 dark:from-pink-700 dark:to-purple-800",
    "bg-gradient-to-r from-indigo-300 to-blue-400 dark:from-indigo-700 dark:to-blue-800",
    "bg-gradient-to-r from-green-300 to-yellow-400 dark:from-green-700 dark:to-yellow-800",
  ]

  return (
    <div className="flex w-full flex-col gap-4 lg:grid lg:grid-cols-3 lg:space-x-2">
      <QueryDataLoader queryResults={guidelinesQuery} skeletonItems={3} addSkeletonContainer={false}>
        <QueryDataLoader.IsSuccess>
          {guidelinesQuery.data?.map((g, ix) => (
            <Card
              key={g.id}
              className="cursor-pointer text-left transition-colors transition-shadow duration-200 hover:border hover:border-primary hover:shadow-lg"
              onClick={() => handleOpen(g.id, g.topicId)}
            >
              <CardHeader className="p-3">
                <CardTitle className="line-clamp-4 font-normal leading-7 lg:h-28">
                  {formatGuidelineValue(g.value)}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between px-3">
                <CardDescription>{Math.max(g.ratings.length, 3)} ratings</CardDescription>
                <div className="flex">
                  {Array.from(Array(3).keys()).map((i) => (
                    <div
                      key={i}
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-sm text-white ${
                        gradients[i + ix]
                      } ${i === 0 ? "" : "-ml-3"}`}
                    >
                      <UserIcon className="h-4 w-4" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </QueryDataLoader.IsSuccess>
        <QueryDataLoader.IsLoading>
          <SkeletonCard className="w-full" />
        </QueryDataLoader.IsLoading>
      </QueryDataLoader>
    </div>
  )
}
