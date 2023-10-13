import { CheckIcon, PlusIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import QueryDataLoader from "../ui/query-data-loader"
import { SmallSpinner } from "../ui/small-spinner"
import { useToast } from "../ui/use-toast"
import { energizeEngine } from "@/lib/energize-engine"
import { Paths, SEARCH_PARAM_KEYS } from "@/lib/paths"
import { usePlaygroundStore } from "@/store/playground-store"
import { useRouter } from "next/router"

export const SubmitGuideline = () => {
  const { activeGuideline, topicId, setSeenGuidelineIds, setActiveGuideline } = usePlaygroundStore()
  const { space_id } = useRouter().query

  const { toast } = useToast()
  const utils = energizeEngine.useContext()

  const [showSimilarGuidelines, setShowSimilarGuidelines] = useState(false)

  const similarityQuery = energizeEngine.guidelines.getTopKSimilarGuidelines.useQuery(
    {
      spaceId: space_id as string,
      query: activeGuideline ? activeGuideline.value : "",
      topicId: topicId as string,
      topK: 2,
    },
    {
      enabled: activeGuideline !== null && !activeGuideline.guidelineId && showSimilarGuidelines,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )

  const submitGuidelineMutation = energizeEngine.guidelines.createGuideline.useMutation()
  const handleSubmitNewGuideline = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()

    setShowSimilarGuidelines(false)

    if (!activeGuideline || activeGuideline.guidelineId || submitGuidelineMutation.isLoading) return

    submitGuidelineMutation.mutate(
      {
        spaceId: space_id as string,
        topicId: topicId as string,
        value: activeGuideline.value,
      },
      {
        onError: (error) => {
          toast({
            title: "Guideline submission failed",
            description: error.message,
            variant: "destructive",
          })
        },
        onSuccess: () => {
          utils.users.getUserScore.refetch()
          utils.tasks.getPilotTasksProgress.refetch()
          toast({
            title: "Guideline submitted",
            description: "Your guideline has been submitted for review.",
            variant: "success",
          })
        },
      },
    )
  }

  const router = useRouter()

  const handleGoToGuideline = (guidelineId: string, topicId: string) => {
    const url = new URL(`/spaces/${space_id}`, window.location.href)

    url.searchParams.set(SEARCH_PARAM_KEYS[Paths.Playground].guidelineId, guidelineId)
    url.searchParams.set(SEARCH_PARAM_KEYS[Paths.Playground].topicId, topicId)

    setActiveGuideline(null)
    setSeenGuidelineIds([])

    // force reload
    router.push(url)

    setShowSimilarGuidelines(false)
  }

  const cards =
    similarityQuery.data?.map((guideline) => (
      <Card
        key={guideline.id}
        onClick={() => {
          handleGoToGuideline(guideline.id, guideline.topicId)
        }}
        className="cursor-pointer hover:border-primary"
      >
        <CardContent className="pt-4">{guideline.value}</CardContent>
      </Card>
    )) ?? null

  return (
    <>
      {!submitGuidelineMutation.isSuccess ? (
        <Dialog open={showSimilarGuidelines} onOpenChange={setShowSimilarGuidelines}>
          <DialogTrigger asChild>
            <Button disabled={submitGuidelineMutation.isLoading} className="w-48">
              Submit guideline
              {submitGuidelineMutation.isLoading ? (
                <SmallSpinner className="ml-2 h-4 w-4" />
              ) : (
                <PlusIcon className="ml-2 h-4 w-4" />
              )}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Does this guideline already exist?</DialogTitle>
              <DialogDescription>If so, please test a similar guideline instead.</DialogDescription>
            </DialogHeader>
            <QueryDataLoader queryResults={similarityQuery}>
              <QueryDataLoader.IsSuccess>{cards}</QueryDataLoader.IsSuccess>
            </QueryDataLoader>
            <DialogFooter>
              <Button className="w-full" disabled={similarityQuery.isLoading} onClick={handleSubmitNewGuideline}>
                Submit new guideline
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <Button className="w-48" variant={"success"} disabled={true}>
          Submitted
          <CheckIcon className="ml-2 h-4 w-4" />
        </Button>
      )}
    </>
  )
}
