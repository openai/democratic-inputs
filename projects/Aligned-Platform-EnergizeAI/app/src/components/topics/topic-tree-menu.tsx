import { ExternalLinkIcon, LinkIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "../ui/button"
import QueryDataLoader from "../ui/query-data-loader"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { energizeEngine } from "@/lib/energize-engine"
import { Paths, SEARCH_PARAM_KEYS } from "@/lib/paths"
import useQueryState from "@/lib/use-query-state"
import { cn } from "@/lib/utils"
import { TopicTree } from "@energizeai/engine"
import { ChevronUpDownIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import { useRouter } from "next/router"

type Props = {
  currentTopicId: string | null
  handleNewTopicId: (topicId: string) => void
  className?: string
  shouldUseQueryState?: boolean
  placeholder?: string
}

export const TopicTreeMenu = ({
  handleNewTopicId,
  currentTopicId,
  className,
  shouldUseQueryState = true,
  placeholder = "Choose topic",
}: Props) => {
  const { space_id } = useRouter().query
  const [open, setOpen] = useState(false)
  const [activeTopicId, setActiveTopicId] = useQueryState<string | null>(SEARCH_PARAM_KEYS[Paths.Playground].topicId, {
    defaultValue: currentTopicId,
    pushStateInHistory: true,
  })

  // update the topic id in the store
  useEffect(() => {
    if (currentTopicId !== activeTopicId) {
      handleNewTopicId(activeTopicId as string)
    }
  }, [activeTopicId])

  const topicTreeQuery = energizeEngine.topics.getTopicsTree.useQuery({
    spaceId: space_id as string,
  })

  const buildTopicDropdown = (topicTree?: TopicTree): null | JSX.Element[] => {
    if (!topicTree) {
      return null
    }

    const topicIds = Object.keys(topicTree)

    return topicIds.map((topicId) => {
      const topic = topicTree[topicId]

      if (topic.children && Object.keys(topic.children).length > 0) {
        return (
          <DropdownMenuSub key={topicId}>
            <DropdownMenuSubTrigger className="flex gap-2">
              <div className="flex flex-1 flex-col items-start justify-start">
                <h3 className="font-medium">{topic.title}</h3>
                <p className="text-xs text-muted-foreground">{topic.description}</p>
              </div>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-[400px]">{buildTopicDropdown(topic.children)}</DropdownMenuSubContent>
          </DropdownMenuSub>
        )
      }

      return (
        <DropdownMenuItem
          key={topicId}
          onClick={() => {
            if (shouldUseQueryState) {
              setActiveTopicId(topicId)
            } else {
              handleNewTopicId(topicId)
            }
          }}
          className="flex flex-col items-start justify-start"
        >
          <h3 className="font-medium">{topic.title}</h3>
          <p className="text-xs text-muted-foreground">{topic.description}</p>
        </DropdownMenuItem>
      )
    })
  }

  const activeTopicData = energizeEngine.topics.getTopic.useQuery(
    {
      spaceId: space_id as string,
      topicId: shouldUseQueryState ? activeTopicId ?? "" : currentTopicId ?? "",
    },
    {
      enabled: shouldUseQueryState ? Boolean(activeTopicId) : Boolean(currentTopicId),
    },
  )

  const topicDropdown = buildTopicDropdown(topicTreeQuery.data)

  return (
    <QueryDataLoader queryResults={topicTreeQuery} skeletonItems={1}>
      <QueryDataLoader.IsLoading>
        <div className={cn("h-10 w-full animate-pulse rounded bg-muted", className)} />
      </QueryDataLoader.IsLoading>
      <QueryDataLoader.IsSuccess>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            {!currentTopicId ? (
              <Button className={cn("flex flex-1 justify-between", className)}>
                {placeholder}
                <ChevronUpDownIcon className="h-5 w-5" />
              </Button>
            ) : (
              <Button className={cn("flex flex-1 justify-between", className)} variant={"outline"}>
                <QueryDataLoader queryResults={activeTopicData} skeletonItems={1}>
                  <QueryDataLoader.IsSuccess>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-gradient-to-r from-green-400 to-blue-500 dark:from-green-500 dark:to-blue-600" />
                      {activeTopicData.data?.title}
                    </div>
                  </QueryDataLoader.IsSuccess>
                  <QueryDataLoader.IsLoading>
                    <div className="h-full w-full animate-pulse rounded bg-muted" />
                  </QueryDataLoader.IsLoading>
                </QueryDataLoader>
                <ChevronUpDownIcon className="h-5 w-5" />
              </Button>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[400px]">
            {topicDropdown === null || topicDropdown.length === 0 ? (
              <>
                <p className="mb-0 p-3 pb-0 text-sm">
                  No topics found. As an admin you can build your taxonomy in the taxonomy builder.
                </p>
                <Link href={`/spaces/${space_id}/taxonomy`}>
                  <Button variant={"link"} className="px-3 py-0">
                    Go To Taxonomy Builder
                    <ExternalLinkIcon className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </>
            ) : (
              topicDropdown
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </QueryDataLoader.IsSuccess>
    </QueryDataLoader>
  )
}
