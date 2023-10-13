import { ArrowDown, Circle } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card"
import QueryDataLoader from "../ui/query-data-loader"
import { SkeletonCard } from "../ui/skeleton-card"
import { useToast } from "../ui/use-toast"
import { energizeEngine } from "@/lib/energize-engine"
import { cn, sleep } from "@/lib/utils"
import { usePlaygroundStore } from "@/store/playground-store"
import { EnergizeEngineOutputs } from "@energizeai/engine"
import { useRouter } from "next/router"

type Props = {
  setInput: (value: string) => void
}

export const SuggestPrompt = ({ setInput }: Props) => {
  const { toast } = useToast()
  const { topicId } = usePlaygroundStore()
  const { space_id } = useRouter().query

  const promptQuery = energizeEngine.prompts.getRandomPromptsForTopic.useQuery(
    {
      spaceId: space_id as string,
      topicId: topicId as string,
      limit: 3,
    },
    {
      enabled: Boolean(topicId),
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  )

  type Prompt = EnergizeEngineOutputs["prompts"]["getRandomPromptsForTopic"][number]
  const handleSuggestPrompt = async (p: Prompt) => {
    try {
      setInput(p.value)

      await sleep(300)

      // click the submit button
      const submitButton = document.getElementById("chat-submit")
      if (submitButton) {
        submitButton.click()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const cards =
    promptQuery.data?.map((p) => (
      <Card
        key={p.id}
        className="cursor-pointer transition-colors duration-150 hover:border-primary"
        onClick={() => handleSuggestPrompt(p)}
      >
        <CardHeader className="h-full flex-col justify-between">
          <CardTitle>{p.value}</CardTitle>
          <CardDescription className="flex w-full justify-end">
            <Avatar className={cn("h-6 w-6")}>
              <AvatarImage src={p.profileImageURL} />
              <AvatarFallback></AvatarFallback>
            </Avatar>
          </CardDescription>
        </CardHeader>
      </Card>
    )) ?? []

  return (
    <div className="flex h-full flex-col items-center justify-between gap-4">
      <div className="flex flex-1 items-center justify-center text-muted-foreground" />
      <div className="grid w-full gap-4 lg:grid-cols-3">
        <QueryDataLoader queryResults={promptQuery} skeletonItems={3} addSkeletonContainer={false}>
          <QueryDataLoader.IsLoading>
            <SkeletonCard className="h-48 w-full" />
          </QueryDataLoader.IsLoading>
          <QueryDataLoader.IsSuccess>{cards}</QueryDataLoader.IsSuccess>
        </QueryDataLoader>
      </div>
    </div>
  )
}
