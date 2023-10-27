import { ActivityIcon, CheckIcon, CopyIcon, EditIcon, XIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { ShareDropdown, ShareDropdownRef } from "../share/share-dropdown"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { Button } from "../ui/button"
import { CardHeader } from "../ui/card"
import { DropdownMenuItem } from "../ui/dropdown-menu"
import { Textarea } from "../ui/textarea"
import { useToast } from "../ui/use-toast"
import { focusOnChatInput } from "./experiment.chat-footer"
import { cn } from "@/lib/utils"
import { usePlaygroundStore } from "@/store/playground-store"

export const PLAYGROUND_GUIDELINE_ID_KEY = "guidelineId"

export const ActiveGuideline = () => {
  const { activeGuideline, activeGuidelineLoading, setActiveGuideline, setActiveType } = usePlaygroundStore()
  const { activeType } = usePlaygroundStore()
  const { toast } = useToast()
  const [isAnimating, setIsAnimating] = useState(false)
  const [showCheckmark, setShowCheckmark] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedValue, setEditedValue] = useState<string>("")

  const handleCopyGuideline = () => {
    if (!activeGuideline) return
    navigator.clipboard.writeText(activeGuideline.value)
    toast({
      title: "Copied",
      description: "Guideline copied to clipboard",
      variant: "success",
    })

    setShowCheckmark(true)

    setTimeout(() => {
      setShowCheckmark(false)
    }, 2000)
  }

  useEffect(() => {
    if (activeGuidelineLoading) {
      setIsAnimating(true)
    } else {
      setIsAnimating(false)
    }
  }, [activeGuidelineLoading])

  const handleSaveEdit = () => {
    if (!Boolean(editedValue)) {
      toast({
        title: "Oops !",
        description: "Guideline cannot be empty",
        variant: "destructive",
      })
    }

    setIsEditing(false)
    setActiveType(0)
    setActiveGuideline({
      value: editedValue,
    })

    toast({
      title: "Edited",
      description: "Guideline edited",
      variant: "success",
    })

    focusOnChatInput()
  }

  const shareDropdownRef = useRef<ShareDropdownRef>(null)
  const copyTestLink = () => {
    if (!activeGuideline || !activeGuideline.guidelineId) return
    const shareUrl = new URL(window.location.href)
    shareUrl.searchParams.set(PLAYGROUND_GUIDELINE_ID_KEY, activeGuideline.guidelineId)

    shareDropdownRef.current?.handleShare(shareUrl.toString())
  }

  if (!activeGuideline) return null

  const title = (
    <AlertTitle className="relative flex items-start justify-between">
      Active guideline ({activeType === 1 ? "Needs Your Help" : "Proposed"})
      {!activeGuidelineLoading && (
        <div className="absolute right-0 top-0 ml-2 flex items-center gap-2">
          {!isEditing ? (
            <>
              {activeGuideline.guidelineId === undefined ? (
                <Button
                  variant={"ghost"}
                  onClick={() => {
                    setEditedValue(activeGuideline.value)
                    setIsEditing(true)
                  }}
                  size={"sm"}
                >
                  <EditIcon className="h-4 w-4" />
                </Button>
              ) : (
                <ShareDropdown ref={shareDropdownRef}>
                  <DropdownMenuItem onClick={copyTestLink}>
                    <CopyIcon className="mr-2 h-4 w-4" />
                    <span>Copy test link</span>
                  </DropdownMenuItem>
                </ShareDropdown>
              )}
              <Button variant={"ghost"} onClick={handleCopyGuideline} size={"sm"}>
                {showCheckmark ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
              </Button>
            </>
          ) : (
            <>
              <Button variant={"ghost"} size={"sm"} onClick={() => setIsEditing(false)}>
                <XIcon className="h-4 w-4" />
              </Button>
              <Button variant={"ghost"} size={"sm"} onClick={handleSaveEdit}>
                <CheckIcon className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      )}
    </AlertTitle>
  )

  return (
    <CardHeader className="pr-0 pt-0">
      <Alert
        variant={activeGuideline.value === "NA" ? "destructive" : "default"}
        className={cn("bg-background", isAnimating && "border-track")}
      >
        <ActivityIcon className="h-4 w-4" />
        {title}
        <AlertDescription className={cn("mr-24", "mt-2")}>
          {isEditing ? (
            <Textarea
              placeholder="Enter guideline..."
              value={editedValue}
              onChange={(e) => setEditedValue(e.target.value)}
              className="w-full"
            />
          ) : (
            <div>{activeGuideline.value}</div>
          )}
        </AlertDescription>
      </Alert>
    </CardHeader>
  )
}
