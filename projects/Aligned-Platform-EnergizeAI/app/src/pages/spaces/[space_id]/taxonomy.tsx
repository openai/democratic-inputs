import { MoveIcon, Pencil, TrashIcon } from "lucide-react"

import { OrgAdminLayout } from "@/components/spaces/settings/space-admin-layout"
import { DeleteTopicDialog } from "@/components/topics/delete-topic-dialog"
import { MoveTopicDialog } from "@/components/topics/move-topic-dialog"
import { TopicForm } from "@/components/topics/topic-form"
import { Button } from "@/components/ui/button"
import QueryDataLoader from "@/components/ui/query-data-loader"
import { SectionHeader } from "@/components/ui/section-header"
import { Separator } from "@/components/ui/separator"
import { energizeEngine } from "@/lib/energize-engine"
import { cn } from "@/lib/utils"
import { TopicTree } from "@energizeai/engine"
import { useRouter } from "next/router"

const OrgTaxonomyPage = () => {
  const { space_id } = useRouter().query

  const topicTreeQuery = energizeEngine.topics.getTopicsTree.useQuery({
    spaceId: space_id as string,
  })

  const gradients = [
    "from-green-400 to-blue-500 dark:from-green-500 dark:to-blue-600",
    "from-pink-400 to-purple-500 dark:from-pink-500 dark:to-purple-600",
    "from-yellow-400 to-red-500 dark:from-yellow-500 dark:to-red-600",
    "from-blue-400 to-green-500 dark:from-blue-500 dark:to-green-600",
    "from-purple-400 to-pink-500 dark:from-purple-500 dark:to-pink-600",
    "from-red-400 to-yellow-500 dark:from-red-500 dark:to-yellow-600",
  ]

  const buildTopicOutline = (topicTree?: TopicTree, depth = 0, parentTopicId: string | null = null) => {
    if (!topicTree) {
      return null
    }

    const topicIds = Object.keys(topicTree)

    const circle = <div className={cn("h-4 w-4 rounded-full bg-gradient-to-r", gradients[depth % gradients.length])} />

    const nodes = topicIds.map((topicId) => {
      const topic = topicTree[topicId]

      return (
        <div className="flex w-full flex-col items-start justify-start" key={topicId + depth}>
          <div className="flex w-full items-start justify-between">
            <div className="flex flex-col items-start justify-start">
              <h3 className="mt-1 flex items-center gap-2 font-medium">
                {circle}
                {topic.title}
              </h3>
              <p className="pb-4 pl-6 pt-2 text-sm text-muted-foreground">{topic.description}</p>
            </div>
            <div className="flex gap-2">
              <TopicForm
                defaultValue={{
                  title: topic.title,
                  description: topic.description || "",
                  id: topicId,
                }}
              >
                <Button variant={"ghost"} size={"sm"}>
                  <span className="sr-only">Edit</span>
                  <Pencil className="h-4 w-4" />
                </Button>
              </TopicForm>
              <MoveTopicDialog topicId={topicId} title={topic.title}>
                <Button variant={"ghost"} size={"sm"}>
                  <span className="sr-only">Move</span>
                  <MoveIcon className="h-4 w-4" />
                </Button>
              </MoveTopicDialog>
              <DeleteTopicDialog topicId={topicId} title={topic.title}>
                <Button variant={"ghost"} size={"sm"}>
                  <span className="sr-only">Delete</span>
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </DeleteTopicDialog>
            </div>
          </div>
          {topic.children && Object.keys(topic.children).length > 0 ? (
            <div className="mt-3 flex w-full flex-col items-start justify-start gap-3 pl-10">
              {buildTopicOutline(topic.children, depth + 1, topicId)}
            </div>
          ) : depth < 2 ? (
            <TopicForm parentTopicId={topicId}>
              <Button variant="secondary" size={"sm"} className="mb-2 ml-5 w-min whitespace-nowrap hover:underline">
                <div
                  className={cn("h-4 w-4 rounded-full bg-gradient-to-r", gradients[(depth + 1) % gradients.length])}
                />
                <span className="ml-2">Add Subtopic</span>
              </Button>
            </TopicForm>
          ) : null}
        </div>
      )
    })

    return (
      <>
        {nodes}
        <TopicForm parentTopicId={parentTopicId}>
          <Button variant="secondary" size={"sm"} className="-ml-3 mb-2 mt-3 w-min whitespace-nowrap hover:underline">
            {circle}
            <span className="ml-2">Add {depth === 0 ? "Topic" : "Subtopic"}</span>
          </Button>
        </TopicForm>
      </>
    )
  }

  return (
    <OrgAdminLayout>
      <div className="flex w-full flex-col gap-4">
        <SectionHeader title="Taxonomy" description="Manage the topic taxonomy in your space" />
        <Separator />
        <QueryDataLoader queryResults={topicTreeQuery}>
          <QueryDataLoader.IsSuccess>
            <QueryDataLoader.IsSuccess>
              <div className="flex w-full flex-col gap-3 pl-3">{buildTopicOutline(topicTreeQuery.data, 0)}</div>
            </QueryDataLoader.IsSuccess>
          </QueryDataLoader.IsSuccess>
        </QueryDataLoader>
      </div>
    </OrgAdminLayout>
  )
}

export default OrgTaxonomyPage
