import { CheckCircle, RefreshCcw } from "lucide-react"
import { useEffect, useState } from "react"

import QueryDataLoader from "../ui/query-data-loader"
import { Separator } from "../ui/separator"
import { SkeletonCard } from "../ui/skeleton-card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { ConstitutionActiveGradient } from "./constitution.active-gradient"
import { focusOnChatInput } from "./experiment.chat-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { energizeEngine } from "@/lib/energize-engine"
import { Paths, SEARCH_PARAM_KEYS } from "@/lib/paths"
import { cn, removeSearchParam, sleep, truncate } from "@/lib/utils"
import { ActiveGuideline, usePlaygroundStore } from "@/store/playground-store"
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/router"

type Props = {
  setOpen: (open: boolean) => void
}

export const NeedsYourHelp = ({ setOpen }: Props) => {
  const {
    topicId,
    setActiveGuideline,
    setTriggerClearMessages,
    seenGuidelineIds,
    activeGuideline,
    clearSeenGuidelineIds,
    addSeenGuidelineId,
    setTriggerAutoSelectGuideline,
    triggerAutoSelectGuideline,
    setActiveGuidelineLoading,
  } = usePlaygroundStore()
  const { activeType, setActiveType } = usePlaygroundStore()

  const router = useRouter()

  const { space_id } = router.query
  const { [SEARCH_PARAM_KEYS[Paths.Playground].guidelineId]: forceGuidelineId } = router.query

  const [loadingActiveGuideline, setLoadingActiveGuideline] = useState<boolean>(false)
  const loadInGuideline = async (g: ActiveGuideline) => {
    if (loadingActiveGuideline) return

    setActiveGuidelineLoading(true)
    setLoadingActiveGuideline(true)

    const split = g.value.split(" ")
    let final = ""

    let totalTimeSlept = 0

    // load in 5 words every 200 ms
    let i = 0
    while (i < split.length) {
      const words = split.slice(i, i + 10)
      const sentence = words.join(" ")
      await sleep(200)

      totalTimeSlept += 200

      setActiveGuideline({
        value: final + sentence,
        guidelineId: g.guidelineId,
      })

      final = final + sentence + " "

      i += 5
    }

    setActiveGuideline({
      value: g.value,
      guidelineId: g.guidelineId,
    })

    setLoadingActiveGuideline(false)

    focusOnChatInput()

    setOpen(false)

    const MIN_TIME = 2000
    setTimeout(
      () => {
        setActiveGuidelineLoading(false)
      },
      Math.max(MIN_TIME - totalTimeSlept, 0),
    )
  }

  const guidelineQuery = energizeEngine.guidelines.getNeedsHelpGuideline.useQuery(
    {
      spaceId: space_id as string,
      topicId: topicId ?? "",
      seen: seenGuidelineIds,
      forceGuidelineId: (forceGuidelineId as string) ?? undefined,
    },
    {
      enabled: Boolean(topicId),
      onSuccess: async (data) => {
        if (
          data &&
          (triggerAutoSelectGuideline ||
            (!activeGuideline &&
              forceGuidelineId &&
              typeof forceGuidelineId === "string" &&
              !seenGuidelineIds.includes(forceGuidelineId)))
        ) {
          const g = data
          setActiveType(1)

          setTriggerClearMessages(true)
          await loadInGuideline({
            value: g.value,
            guidelineId: g.id,
          })

          setTriggerAutoSelectGuideline(false)
        }
      },
    },
  )

  const handleClickOnGuideline = () => {
    if (!guidelineQuery.data) return
    setActiveType(activeType === 1 ? 0 : 1)

    if (activeType !== 1) {
      setTriggerClearMessages(true)
      loadInGuideline({
        value: guidelineQuery.data.value,
        guidelineId: guidelineQuery.data.id,
      })
    } else {
      setActiveGuideline(null)
    }
  }

  const guidelineData = guidelineQuery.data && guidelineQuery.data ? guidelineQuery.data : null
  const card = guidelineData ? (
    <div className="flex-col">
      <div className="relative">
        {activeType === 1 && <ConstitutionActiveGradient />}
        <Card
          className={cn(
            "relative cursor-pointer ring-offset-2 ring-offset-background",
            "rounded-lg",
            activeType !== 1 && "hover:ring-2 hover:ring-primary",
          )}
          onClick={handleClickOnGuideline}
        >
          <CardContent className="pt-5">{truncate(guidelineData.value, 215)}</CardContent>
          <CardFooter className="flex items-center justify-between">
            {guidelineData.userRatingExists ? (
              <small className="flex gap-2 text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-success" />
                You have already rated this guideline
              </small>
            ) : (
              <small className="text-muted-foreground">Tested by {guidelineData.ratingsCount} users</small>
            )}
            <div className="flex gap-2">
              <Button
                size={"sm"}
                variant={"secondary"}
                onClick={(e) => {
                  if (activeType === 1) {
                    setActiveGuideline(null)
                  }
                  e.stopPropagation()
                  addSeenGuidelineId(guidelineData.id)
                  setActiveType(0)
                }}
                className="hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Skip
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
      <div className="mx-auto h-3 w-[98%] rounded-md rounded-t-none border border-t-0" />
      <div className="mx-auto h-3 w-[96%] rounded-md rounded-t-none border border-t-0" />
    </div>
  ) : null

  return (
    <>
      <TooltipProvider delayDuration={0} skipDelayDuration={0}>
        <h3 className="flex items-center gap-2 font-semibold">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-2">
                <ExclamationTriangleIcon className="h-4 w-4" />
                Needs Your Help
              </span>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={12} className="radix-tooltip-content">
              Guidelines proposed by others in the community. Click a card to test it, then mark as Helpful or Not
              Helpful!
            </TooltipContent>
          </Tooltip>
        </h3>
      </TooltipProvider>
      <QueryDataLoader queryResults={guidelineQuery} skeletonItems={1}>
        <QueryDataLoader.IsSuccess>{card}</QueryDataLoader.IsSuccess>
        <QueryDataLoader.IsLoading>
          <SkeletonCard />
        </QueryDataLoader.IsLoading>
        {!guidelineData && (
          <QueryDataLoader.IsEmpty>
            <div className="flex w-full flex-col items-center justify-center gap-4 rounded border border-dashed px-8 py-20 text-center">
              No more guidelines to display.
              <Separator />
              <span className="pb-2 text-sm text-muted-foreground">Choose a different topic above to view more</span>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="flex bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>
              <Button
                variant={"ghost"}
                onClick={() => {
                  clearSeenGuidelineIds()
                  setActiveType(0)
                }}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </QueryDataLoader.IsEmpty>
        )}
      </QueryDataLoader>
    </>
  )
}
