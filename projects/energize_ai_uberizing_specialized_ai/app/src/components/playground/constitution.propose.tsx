import { PencilIcon } from "lucide-react"
import { useState } from "react"

import { SmallSpinner } from "../ui/small-spinner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { useToast } from "../ui/use-toast"
import { ConstitutionActiveGradient } from "./constitution.active-gradient"
import { focusOnChatInput } from "./experiment.chat-footer"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { energizeEngine } from "@/lib/energize-engine"
import useStreamTextDataFromApi from "@/lib/use-stream-text-data-from-api"
import { cn } from "@/lib/utils"
import { usePlaygroundStore } from "@/store/playground-store"
import { SparklesIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/router"

type Props = {
  setOpen: (open: boolean) => void
}

export const ConstitutionPropose = ({ setOpen }: Props) => {
  const { setActiveGuideline, topicId, setTriggerClearMessages } = usePlaygroundStore()
  const { activeType, setActiveType, setActiveGuidelineLoading } = usePlaygroundStore()
  const { space_id } = useRouter().query

  const activeTopicData = energizeEngine.topics.getTopicWithTreePath.useQuery(
    {
      spaceId: space_id as string,
      topicId: topicId ?? "",
    },
    {
      enabled: Boolean(topicId),
    },
  )

  const [proposal, setProposal] = useState<string>("")

  const streamTextDataFromApi = useStreamTextDataFromApi()

  const { toast } = useToast()

  const [isProposing, setIsProposing] = useState<boolean>(false)
  const handlePropose = async () => {
    if (!proposal || isProposing || !activeTopicData.isSuccess) return
    setIsProposing(true)
    setActiveGuidelineLoading(true)

    setActiveGuideline({
      value: "Proposing...",
    })

    const showErrorToast = (d: string) => {
      toast({
        title: "Error",
        description: d,
        variant: "destructive",
      })
    }

    const body = {
      topicTitle: activeTopicData.data.treePath,
      userMessage: proposal,
    }

    await streamTextDataFromApi({
      body,
      apiUrl: "/api/playground/propose",
      onMessage: (data) => {
        if (data.trim().toLowerCase() === "na" || data.trim().toLowerCase() === "error") {
          return showErrorToast("Please try again. Make sure you are on topic and proposing a guideline.")
        }

        setActiveGuideline({
          value: data,
        })
        focusOnChatInput()
        setActiveType(2)
        setTriggerClearMessages(true)
      },
      onError: showErrorToast,
      onFinally: () => {
        setIsProposing(false)
        setActiveGuidelineLoading(false)
      },
    })
  }

  return (
    <>
      <TooltipProvider delayDuration={0} skipDelayDuration={0}>
        <h3 className="flex items-center gap-2 font-semibold">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-2 font-semibold">
                <PencilIcon className="h-4 w-4" />
                Propose
              </span>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={12} className="radix-tooltip-content">
              Brainstorm a new guideline. Draft, test, and submit it to the community. It&apos;ll appear in their Needs
              Your Help sections.
            </TooltipContent>
          </Tooltip>
        </h3>
      </TooltipProvider>
      <div className="relative">
        {activeType === 2 && <ConstitutionActiveGradient />}
        <div className="relative rounded-lg border bg-background p-3 focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <Textarea
            placeholder={
              activeTopicData.data
                ? `When talking about ${activeTopicData.data.title.toLowerCase()}, I think the model should...`
                : "I think the model should..."
            }
            className={cn("min-h-[120px] resize-none border-none p-0 focus-visible:ring-0")}
            value={proposal}
            onChange={(e) => {
              setProposal(e.target.value)
              setActiveType(0)
            }}
          />
          <div className="flex justify-end gap-2">
            {proposal.length > 0 && (
              <Button
                variant={"secondary"}
                onClick={() => {
                  if (activeType === 2) {
                    setActiveGuideline(null)
                  }
                  setProposal("")
                  setActiveType(0)
                }}
              >
                Clear
              </Button>
            )}
            <Button
              disabled={!Boolean(proposal) || isProposing || activeType === 2}
              onClick={() => {
                handlePropose()
                setOpen(false)
              }}
            >
              Draft with AI
              {isProposing ? <SmallSpinner className="ml-2" /> : <SparklesIcon className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
