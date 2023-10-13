import { Message } from "ai"
import { motion } from "framer-motion"
import { ArrowRight, CheckIcon, RotateCcw, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { z } from "zod"

import { Checkbox } from "../ui/checkbox"
import QueryDataLoader from "../ui/query-data-loader"
import { SmallSpinner } from "../ui/small-spinner"
import { useToast } from "../ui/use-toast"
import { ReviseGuidelinePopover } from "./experiment.revise-guideline-popover"
import { SubmitGuideline } from "./experiment.submit-guideline"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { energizeEngine } from "@/lib/energize-engine"
import { cn } from "@/lib/utils"
import { usePlaygroundStore } from "@/store/playground-store"
import { RatingsSchema } from "@energizeai/engine"
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/router"

type Props = {
  messages: Message[]
  handleRevisionComplete: () => void
}

export const GuidelineActions = ({ messages, handleRevisionComplete }: Props) => {
  const [isOpen, setIsOpen] = useState(false)
  const { space_id } = useRouter().query
  const { activeGuideline, addSeenGuidelineId, setTriggerAutoSelectGuideline } = usePlaygroundStore()
  const [selectedRating, setSelectedRating] = useState<z.infer<typeof RatingsSchema> | null>(null)

  const { toast } = useToast()

  const utils = energizeEngine.useContext()
  const ratingMutation = energizeEngine.ratings.rateGuideline.useMutation()
  const deleteRatingMutation = energizeEngine.ratings.hardDeleteRating.useMutation()

  useEffect(() => {
    ratingMutation.reset()
  }, [isOpen])

  const isCreatingGuideline = activeGuideline?.guidelineId === undefined

  const ratingQuery = energizeEngine.ratings.getRatingForGuideline.useQuery(
    {
      spaceId: space_id as string,
      guidelineId: activeGuideline?.guidelineId ?? "",
    },
    {
      enabled: Boolean(activeGuideline?.guidelineId),
      refetchOnWindowFocus: false,
      retry: false,
      retryOnMount: false,
    },
  )

  const ratingTagsQuery = energizeEngine.ratingTags.getRatingTags.useQuery(
    {
      spaceId: space_id as string,
    },
    {
      refetchOnWindowFocus: false,
      retry: false,
      retryOnMount: false,
    },
  )

  const [selectedRatingTagIds, setSelectedRatingTagIds] = useState<string[]>([])

  const handleRating = () => {
    if (!activeGuideline || !activeGuideline.guidelineId || !selectedRating) return
    ratingMutation.mutate(
      {
        spaceId: space_id as string,
        guidelineId: activeGuideline.guidelineId,
        rating: selectedRating,
        ratingTagIds: selectedRatingTagIds ?? [],
      },
      {
        onError: () => {
          toast({
            title: "Error",
            description: "Could not rate guideline",
            variant: "destructive",
          })
        },
        onSuccess: () => {
          ratingQuery.refetch()
          utils.tasks.getPilotTasksProgress.refetch()
          utils.ratings.getMyRatingsHistory.invalidate()
        },
      },
    )
  }

  const deleteRating = (ratingId: string) => {
    if (!activeGuideline || !activeGuideline.guidelineId) return
    deleteRatingMutation.mutate(
      {
        spaceId: space_id as string,
        ratingId,
      },
      {
        onError: () => {
          toast({
            title: "Error",
            description: "Could not delete rating",
            variant: "destructive",
          })
        },
        onSuccess: () => {
          setSelectedRatingTagIds([])
          setSelectedRating(null)
          ratingMutation.reset()
          utils.ratings.getRatingForGuideline.refetch()
        },
      },
    )
  }

  const isLoading =
    ratingMutation.isLoading ||
    ratingQuery.isLoading ||
    deleteRatingMutation.isLoading ||
    ratingQuery.isRefetching ||
    ratingTagsQuery.isFetching

  let viewMode: "rate" | "select_tag" | "undo" | "change" = "rate"

  if (ratingMutation.isSuccess && ratingQuery.data?.rating) {
    viewMode = "undo"
  } else if (ratingQuery.data?.rating) {
    viewMode = "change"
  } else if (selectedRating) {
    viewMode = "select_tag"
  } else {
    viewMode = "rate"
  }

  const helpfulNotHelpfulButtons =
    viewMode === "rate" ? (
      <>
        <Button
          size={"sm"}
          onClick={() => setSelectedRating("helpful")}
          disabled={ratingMutation.isLoading || ratingQuery.isLoading}
        >
          Helpful
          <ThumbsUpIcon className="ml-2 h-4 w-4" />
        </Button>
        <Button
          size={"sm"}
          variant={"destructive"}
          onClick={() => setSelectedRating("not_helpful")}
          disabled={ratingMutation.isLoading || ratingQuery.isLoading}
        >
          Not helpful
          <ThumbsDownIcon className="ml-2 h-4 w-4" />
        </Button>
      </>
    ) : viewMode === "select_tag" ? (
      <>
        <Button size={"sm"} variant={"ghost"} onClick={() => setSelectedRating(null)}>
          Back
          <ChevronDoubleLeftIcon className="ml-2 h-4 w-4" />
        </Button>
        <Button size={"sm"} onClick={() => handleRating()} disabled={ratingMutation.isLoading || ratingQuery.isLoading}>
          {selectedRatingTagIds.length > 0 ? (
            <>
              Submit
              <CheckIcon className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Skip
              <ChevronDoubleRightIcon className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </>
    ) : viewMode === "undo" || viewMode === "change" ? (
      <>
        <Button
          variant={"secondary"}
          onClick={() => deleteRating(ratingQuery.data?.id ?? "")}
          disabled={deleteRatingMutation.isLoading || ratingQuery.isLoading}
        >
          {viewMode === "undo" ? <>Undo</> : <>Re-Rate</>}
          {!deleteRatingMutation.isLoading && !ratingQuery.isLoading ? (
            <RotateCcw className="ml-2 h-4 w-4" />
          ) : (
            <SmallSpinner className="ml-2 h-4 w-4" />
          )}
        </Button>
        <Button
          onClick={() => {
            setTriggerAutoSelectGuideline(true)
            setIsOpen(false)

            if (activeGuideline?.guidelineId) addSeenGuidelineId(activeGuideline.guidelineId)
          }}
        >
          Next guideline
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </>
    ) : null

  const proposeGuidelineActions = (
    <>
      <ReviseGuidelinePopover messages={messages} handleRevisionComplete={handleRevisionComplete} />
      <SubmitGuideline />
    </>
  )

  const header = (
    <DialogHeader>
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <DialogTitle>
          {viewMode === "undo" ? (
            <>Success! 🎉</>
          ) : viewMode === "change" ? (
            <>Change your rating</>
          ) : viewMode === "select_tag" ? (
            <>Why {selectedRating?.replaceAll("_", " ")}?</>
          ) : (
            <>
              What do you think?
              {ratingMutation.isLoading && <SmallSpinner className="ml-2 inline-block h-4 w-4" />}
            </>
          )}
        </DialogTitle>
        {(viewMode === "rate" || viewMode === "select_tag") && (
          <DialogDescription>The best guidelines are both principled and practical.</DialogDescription>
        )}
      </motion.div>
    </DialogHeader>
  )

  const trigger = (
    <DialogTrigger asChild>
      {!isCreatingGuideline ? (
        <>
          {viewMode === "change" ? (
            <Button
              className="w-48 bg-background"
              type="button"
              variant={"outline"}
              onClick={() => {
                setIsOpen(true)
              }}
            >
              Change from
              {ratingQuery.data && ratingQuery.data.rating === "helpful" ? (
                <ThumbsUpIcon className="ml-2 h-4 w-4 text-success" fill="cyan" stroke="black" />
              ) : (
                <ThumbsDownIcon className="ml-2 h-4 w-4 text-destructive" fill="#faa0a0" stroke="black" />
              )}
            </Button>
          ) : !ratingQuery.isFetching ? (
            <>
              <Button
                className="w-48"
                type="button"
                onClick={() => {
                  setSelectedRating("helpful")
                  setIsOpen(true)
                }}
                disabled={ratingMutation.isLoading || ratingQuery.isLoading}
              >
                Helpful
                <ThumbsUpIcon className="ml-2 h-4 w-4" />
              </Button>
              <Button
                className="w-48"
                variant={"destructive"}
                type="button"
                onClick={() => {
                  setSelectedRating("not_helpful")
                  setIsOpen(true)
                }}
                disabled={ratingMutation.isLoading || ratingQuery.isLoading}
              >
                Not helpful
                <ThumbsDownIcon className="ml-2 h-4 w-4" />
              </Button>
            </>
          ) : null}
        </>
      ) : (
        proposeGuidelineActions
      )}
    </DialogTrigger>
  )

  const filteredRatingTags = (ratingTagsQuery.data ?? []).filter((r) => r.rating === selectedRating) ?? []

  const body =
    viewMode === "undo" ? (
      <>Thanks for contributing!</>
    ) : viewMode === "change" ? (
      <>Are you sure you want to change your rating?</>
    ) : viewMode === "select_tag" ? (
      <div className="flex flex-col gap-2">
        <QueryDataLoader
          queryResults={ratingTagsQuery}
          forceState={filteredRatingTags.length === 0 ? "empty" : undefined}
        >
          <QueryDataLoader.IsSuccess>
            {filteredRatingTags.map((tag) => (
              <Button
                key={tag.id}
                variant={"outline"}
                className={cn("flex justify-start gap-4", selectedRatingTagIds.includes(tag.id) && "border-primary")}
                onClick={() => {
                  if (selectedRatingTagIds.includes(tag.id)) {
                    setSelectedRatingTagIds(selectedRatingTagIds.filter((id) => id !== tag.id))
                  } else {
                    setSelectedRatingTagIds([...selectedRatingTagIds, tag.id])
                  }
                }}
              >
                <Checkbox checked={selectedRatingTagIds.includes(tag.id)} />
                {tag.value}
              </Button>
            ))}
          </QueryDataLoader.IsSuccess>
          <QueryDataLoader.IsEmpty>
            <div className="w-full rounded border border-dashed py-10 text-center">
              No rating tags to display. Feel free to skip.
            </div>
          </QueryDataLoader.IsEmpty>
        </QueryDataLoader>
      </div>
    ) : (
      <>{activeGuideline ? activeGuideline.value : "ERROR"}</>
    )

  return (
    <Dialog open={isOpen} onOpenChange={(v) => setIsOpen(v)}>
      {trigger}
      <DialogContent>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            <div className="h-5 w-full animate-pulse rounded bg-muted" />
            <div className="h-5 w-full animate-pulse rounded bg-muted" />
            <div className="h-5 w-full animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <>
            {header}
            {body}
            <DialogFooter className="grid w-full grid-cols-2">{helpfulNotHelpfulButtons}</DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
