import { ExternalLink } from "lucide-react"
import { useState } from "react"

import QueryDataLoader from "../ui/query-data-loader"
import { Skeleton } from "../ui/skeleton"
import { SkeletonCard } from "../ui/skeleton-card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { CardHeader } from "@/components/ui/card"
import { energizeEngine } from "@/lib/energize-engine"
import { Paths, SEARCH_PARAM_KEYS } from "@/lib/paths"
import { DEFAULT_SPACE_ID } from "@/lib/spaces"
import { cn } from "@/lib/utils"
import { useAuth } from "@clerk/clerk-react"
import { EnergizeEngineOutputs, TopicTree } from "@energizeai/engine"
import { HandRaisedIcon } from "@heroicons/react/24/outline"
import Link from "next/link"

const formatGuidelineValue = (value: string) => {
  const parts = value.split(/(\[[^\]]+\])/)
  return (
    <span className="inline">
      {parts.map((part, index) => {
        if (part.startsWith("[") && part.endsWith("]")) {
          return (
            <span key={index} className="inline font-semibold">
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

type DotProps = {
  variant: "helpful" | "not-helpful" | "placeholder"
  className?: string
}

const Dot = ({ variant, className }: DotProps) => {
  return (
    <div
      className={cn(
        "h-5 w-full rounded-md",
        variant === "helpful" && "bg-sky-400 dark:bg-sky-500",
        variant === "not-helpful" && "bg-pink-400 dark:bg-pink-500",
        variant === "placeholder" && "bg-transparent",
        className,
      )}
    />
  )
}

type GuidelineItemProps = {
  guideline: EnergizeEngineOutputs["guidelines"]["getLiveConstitution"]["items"][number]
  isOpen: boolean
}

const GuidelineItem = ({ guideline, isOpen }: GuidelineItemProps) => {
  const graphQuery = energizeEngine.guidelines.getHistogramDataForGuideline.useQuery(
    {
      spaceId: DEFAULT_SPACE_ID,
      guidelineId: guideline.id,
    },
    {
      enabled: isOpen,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  )

  const NUM_BUCKETS = 15
  const BUCKET_SIZE = 2 / NUM_BUCKETS

  type BucketItem = EnergizeEngineOutputs["guidelines"]["getHistogramDataForGuideline"][number]
  const buckets: BucketItem[][] = graphQuery.isSuccess
    ? Array.from({ length: NUM_BUCKETS }).map((_, index) => {
        const min = -1
        const bucketStart = min + index * BUCKET_SIZE
        const bucketEnd = bucketStart + BUCKET_SIZE

        return graphQuery.data.filter((rating) => {
          return rating.userIntercept >= bucketStart && rating.userIntercept < bucketEnd
        })
      })
    : []

  const header = (
    <>
      <h3 className="text-center lg:text-left">Did Aligned users find this guideline helpful?</h3>
      <div className="flex justify-center gap-2 lg:justify-start">
        <Dot variant="helpful" className="w-5" />
        Helpful
        <div className="w-4"></div>
        <Dot variant="not-helpful" className="w-5" />
        Not Helpful
      </div>
    </>
  )

  const main = (
    <div className="flex flex-row items-end gap-[4px]">
      {buckets.map((bucket, index) => (
        <div key={index + "bucket"} className="flex h-full flex-1 flex-col justify-end gap-[4px]">
          {bucket.map((v) => (
            <>{v.rating === "helpful" ? <Dot variant="helpful" /> : <Dot variant="not-helpful" />}</>
          ))}
          {bucket.length === 0 && <Dot variant="placeholder" />}
        </div>
      ))}
    </div>
  )

  const footer = (
    <>
      <div className="mt-[4px] h-[2px] w-full bg-muted-foreground"></div>
    </>
  )

  const graph = graphQuery ? (
    <div className="flex w-full flex-col gap-4">
      {header}
      <div className="my-4 w-full">
        <QueryDataLoader queryResults={graphQuery} skeletonItems={1}>
          <QueryDataLoader.IsLoading>
            <Skeleton className="my-4 h-16 w-full" />
          </QueryDataLoader.IsLoading>
          <QueryDataLoader.IsSuccess>{main}</QueryDataLoader.IsSuccess>
        </QueryDataLoader>
        {footer}
      </div>
    </div>
  ) : null

  return (
    <AccordionItem key={guideline.id} value={guideline.id} className="border-b-0">
      <AccordionTrigger>
        <div className="flex w-full flex-col justify-between px-0 pb-1 pt-0">
          <CardHeader className="p-0 text-left font-normal">
            <span>{formatGuidelineValue(guideline.value)}</span>
          </CardHeader>
          <div className="mr-2 flex items-center pt-4 text-sm">
            <HandRaisedIcon className="mr-1 h-4 w-4 flex-shrink-0" />
            {guideline.ratingsCount}
            <span className="px-2" />
            <img src="/logo.png" alt="Logo" className="mr-2 h-4 text-primary-foreground" />
            {Math.floor(guideline.consensusScore * 100)}%
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>{graph}</AccordionContent>
    </AccordionItem>
  )
}

export const ConstitutionOutline = () => {
  const { userId } = useAuth()
  const [open, setOpen] = useState<string[]>([])

  const constitution = energizeEngine.guidelines.getLiveConstitution.useQuery({
    spaceId: DEFAULT_SPACE_ID,
  })

  const topicTreeQuery = energizeEngine.topics.getTopicsTree.useQuery({
    spaceId: DEFAULT_SPACE_ID as string,
  })

  const gradients = [
    "from-green-400 to-blue-500 dark:from-green-500 dark:to-blue-600",
    "from-pink-400 to-purple-500 dark:from-pink-500 dark:to-purple-600",
    "from-yellow-400 to-red-500 dark:from-yellow-500 dark:to-red-600",
    "from-blue-400 to-green-500 dark:from-blue-500 dark:to-green-600",
    "from-purple-400 to-pink-500 dark:from-purple-500 dark:to-pink-600",
    "from-red-400 to-yellow-500 dark:from-red-500 dark:to-yellow-600",
  ]

  const buildTopicOutline = (topicTree?: TopicTree, depth = 0) => {
    if (!topicTree) {
      return null
    }

    const topicIds = Object.keys(topicTree)

    return topicIds.map((topicId) => {
      const topic = topicTree[topicId]

      const approvedGuidelines = constitution.data?.items.filter((guideline) => guideline.topic.id === topicId)

      const accordion =
        approvedGuidelines && approvedGuidelines.length > 0 ? (
          <Accordion onValueChange={setOpen} type="multiple" className="ml-6 flex flex-grow flex-col">
            {approvedGuidelines.map((guideline) => (
              <GuidelineItem key={guideline.id} guideline={guideline} isOpen={open.includes(guideline.id)} />
            ))}
          </Accordion>
        ) : null

      return (
        <div className="flex flex-col items-start justify-start" key={topicId + depth}>
          <h3 className="mt-2 flex items-center gap-2 font-medium">
            <div className={cn("h-4 w-4 rounded-full bg-gradient-to-r", gradients[depth % gradients.length])} />
            {topic.title}
          </h3>
          <p className="pb-4 pl-6 text-xs text-muted-foreground">{topic.description}</p>
          {accordion}
          {approvedGuidelines && approvedGuidelines.length === 0 && Object.keys(topic.children ?? 0).length === 0 && (
            <div className="ml-6 mt-4 flex items-center justify-center rounded border border-dashed px-3 py-2 text-sm text-muted-foreground">
              No approved guidelines yet.
              {userId && (
                <Link href={`/spaces/${DEFAULT_SPACE_ID}?${SEARCH_PARAM_KEYS[Paths.Playground].topicId}=${topicId}`}>
                  <Button variant={"ghost"} size={"sm"} className="ml-2 flex items-center justify-center gap-1 px-2">
                    Contribute
                    <ExternalLink className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          )}
          {topic.children && Object.keys(topic.children).length > 0 && (
            <div className="mt-4 flex flex-col items-start justify-start gap-4 pl-10">
              {buildTopicOutline(topic.children, depth + 1)}
            </div>
          )}
        </div>
      )
    })
  }

  return (
    <>
      <div className="relative my-14">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="flex bg-background px-2 text-muted-foreground">Start of the Constitution</span>
        </div>
      </div>
      <QueryDataLoader queryResults={constitution}>
        <QueryDataLoader.IsSuccess>
          <QueryDataLoader queryResults={topicTreeQuery} skeletonItems={1}>
            <QueryDataLoader.IsSuccess>
              <div className="flex flex-col gap-4">{buildTopicOutline(topicTreeQuery.data)}</div>
            </QueryDataLoader.IsSuccess>
          </QueryDataLoader>
        </QueryDataLoader.IsSuccess>
      </QueryDataLoader>
      <div className="my-5 flex w-full flex-col items-center text-right text-sm text-gray-400">
        Last updated {constitution.data?.items[0].lastUpdated.toLocaleString()}.
      </div>
    </>
  )
}
