import { Button } from "../ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card"
import QueryDataLoader from "../ui/query-data-loader"
import { SmallSpinner } from "../ui/small-spinner"
import { useToast } from "../ui/use-toast"
import { energizeEngine } from "@/lib/energize-engine"
import { EnergizeEngineOutputs } from "@energizeai/engine"
import { useRouter } from "next/router"

type TopicSuggestion = EnergizeEngineOutputs["topicSuggestions"]["getTopicSuggestions"][number]

type Props = {
  topicSuggestion: TopicSuggestion
}

export const TopicSuggestionCard = ({ topicSuggestion }: Props) => {
  const { space_id } = useRouter().query

  const ancestors = energizeEngine.topics.getTopicAncestors.useQuery({
    spaceId: space_id as string,
    topicId: topicSuggestion.parentTopicId,
  })

  const rejectMutation = energizeEngine.topicSuggestions.deleteTopicSuggestion.useMutation()
  const approveMutation = energizeEngine.topicSuggestions.approveTopicSuggestion.useMutation()

  const { toast } = useToast()

  const utils = energizeEngine.useContext()

  const handleApprove = () => {
    approveMutation.mutate(
      {
        spaceId: space_id as string,
        id: topicSuggestion.id,
      },
      {
        onSuccess: () => {
          toast({
            title: "Success!",
            description: "Topic suggestion approved.",
            variant: "success",
          })
          utils.topicSuggestions.getTopicSuggestions.invalidate()
        },
        onError: (error) => {
          toast({
            title: "Error!",
            description: error.message,
            variant: "destructive",
          })
        },
      },
    )
  }

  const handleReject = () => {
    rejectMutation.mutate(
      {
        spaceId: space_id as string,
        id: topicSuggestion.id,
      },
      {
        onSuccess: () => {
          toast({
            title: "Success!",
            description: "Topic suggestion rejected.",
          })
          utils.topicSuggestions.getTopicSuggestions.invalidate()
        },
        onError: (error) => {
          toast({
            title: "Error!",
            description: error.message,
            variant: "destructive",
          })
        },
      },
    )
  }

  return (
    <Card className="flex items-center justify-between border pr-8 transition-all hover:border-primary hover:shadow-sm">
      <CardHeader>
        <CardTitle className="mb-2 flex items-center gap-2">
          <QueryDataLoader queryResults={ancestors} skeletonItems={1}>
            <QueryDataLoader.IsSuccess>
              <div className="text-center font-semibold">
                {ancestors.data?.map((t) => t.title).join(" > ")}
                <span className="ml-1">{" > "}</span>
              </div>
            </QueryDataLoader.IsSuccess>
            <QueryDataLoader.IsLoading>
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            </QueryDataLoader.IsLoading>
            <QueryDataLoader.IsEmpty>
              <div className="text-center font-semibold">{"ROOT > "}</div>
            </QueryDataLoader.IsEmpty>
          </QueryDataLoader>
          {topicSuggestion.title}
          <span className="rounded-full border px-4 py-1 text-xs font-medium text-muted-foreground">
            {topicSuggestion.createdAt.toLocaleDateString()}
          </span>
        </CardTitle>
        <CardDescription>{topicSuggestion.description}</CardDescription>
      </CardHeader>
      <div className="flex gap-2">
        <Button disabled={approveMutation.isLoading || rejectMutation.isLoading} onClick={handleApprove}>
          Approve
          {approveMutation.isLoading && <SmallSpinner className="ml-2" />}
        </Button>
        <Button
          variant={"destructive"}
          disabled={approveMutation.isLoading || rejectMutation.isLoading}
          onClick={handleReject}
        >
          Reject
          {rejectMutation.isLoading && <SmallSpinner className="ml-2" />}
        </Button>
      </div>
    </Card>
  )
}
