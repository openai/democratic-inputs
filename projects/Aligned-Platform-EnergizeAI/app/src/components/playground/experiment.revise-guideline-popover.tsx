import { Message } from "ai"
import { FileEdit } from "lucide-react"
import { useState } from "react"

import { Button } from "../ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { SmallSpinner } from "../ui/small-spinner"
import { Textarea } from "../ui/textarea"
import { useToast } from "../ui/use-toast"
import { energizeEngine } from "@/lib/energize-engine"
import useStreamTextDataFromApi from "@/lib/use-stream-text-data-from-api"
import { usePlaygroundStore } from "@/store/playground-store"
import { useRouter } from "next/router"

type Props = {
  handleRevisionComplete: () => void
  messages: Message[]
}

export const ReviseGuidelinePopover = ({ handleRevisionComplete, messages }: Props) => {
  const [revision, setRevision] = useState<string>("")
  const [isRevisingPopoverOpen, setIsRevisingPopoverOpen] = useState<boolean>(false)
  const streamTextDataFromApi = useStreamTextDataFromApi()

  const {
    topicId,
    activeGuideline,
    setActiveGuideline,
    setActiveGuidelineLoading,
    setActiveType,
    isRevising,
    setIsRevising,
  } = usePlaygroundStore()
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

  const { toast } = useToast()

  const handleRevise = async () => {
    if (!revision || isRevising || !activeGuideline || !activeTopicData.isSuccess) return

    setActiveGuidelineLoading(true)
    setIsRevising(true)

    const filtered = messages.map((m) => {
      const { createdAt, id, ...rest } = m
      return rest
    })

    const body = {
      topicTitle: activeTopicData.data.treePath,
      activeGuideline: activeGuideline.value,
      revision,
      messages: filtered,
    }

    const showErrorToast = (d: string) => {
      toast({
        title: "Error",
        description: d,
        variant: "destructive",
      })
    }

    await streamTextDataFromApi({
      body,
      apiUrl: "/api/playground/revise",
      onMessage: (data) => {
        if (data.trim().toLowerCase() === "na" || data.trim().toLowerCase() === "error") {
          return showErrorToast("Please try again. Make sure you are on topic and revising a guideline.")
        }
        setActiveGuideline({
          value: data,
        })
      },
      onError: showErrorToast,
      onDone: () => {
        setIsRevising(false)
        setIsRevisingPopoverOpen(false)
        setRevision("")

        handleRevisionComplete()
      },
      onFinally: () => {
        setIsRevising(false)
        setActiveGuidelineLoading(false)
        setActiveType(0)
      },
    })
  }

  return (
    <Popover open={isRevisingPopoverOpen} onOpenChange={setIsRevisingPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant={"secondary"} className="w-48 whitespace-nowrap">
          Revise guideline
          <FileEdit className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-80 flex-col gap-4" side="top">
        <div className="flex gap-2 text-sm">
          <img src="/logo.png" alt="Logo" className="h-6 text-primary-foreground" />
          What would you like to change? (e.g. add X, remove Y, update Z, etc.)
        </div>
        <Textarea
          placeholder="I wanted the model to respond..."
          className="w-full resize-none"
          rows={7}
          value={revision}
          onChange={(e) => setRevision(e.target.value)}
        />
        <Button size={"sm"} disabled={!Boolean(revision) || isRevising} onClick={handleRevise}>
          Revise
          {isRevising && <SmallSpinner className="ml-2 h-4 w-4" />}
        </Button>
      </PopoverContent>
    </Popover>
  )
}
