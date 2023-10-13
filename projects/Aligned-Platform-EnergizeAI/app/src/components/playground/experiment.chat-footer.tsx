import { Message } from "ai"
import { EraserIcon, PlusCircle, SendIcon, SquareIcon } from "lucide-react"
import { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useRef } from "react"

import { Button } from "../ui/button"
import { CardFooter } from "../ui/card"
import { SmallSpinner } from "../ui/small-spinner"
import { GuidelineActions } from "./experiment.guideline-actions"
import { energizeEngine } from "@/lib/energize-engine"
import { usePlaygroundStore } from "@/store/playground-store"
import { useRouter } from "next/router"

export const CHAT_FOOTER_INPUT_ID = "chat-input"

export const focusOnChatInput = () => {
  const elem = document.getElementById(CHAT_FOOTER_INPUT_ID)
  if (elem) {
    elem.focus()
  }
}

type Props = {
  messages: Message[]
  setMessages: (messages: Message[]) => void
  isLoading: boolean
  stop: () => void
  input: string
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
  handleParallelSubmit: (e: FormEvent<HTMLFormElement>) => void
  handleRevisionComplete: () => void
}

export const ChatFooter = ({
  messages,
  isLoading,
  stop,
  input,
  setMessages,
  handleInputChange,
  handleParallelSubmit,
  handleRevisionComplete,
}: Props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { topicId, activeGuideline } = usePlaygroundStore()
  const { space_id } = useRouter().query

  const activeTopicData = energizeEngine.topics.getTopic.useQuery(
    {
      spaceId: space_id as string,
      topicId: topicId ?? "",
    },
    {
      enabled: Boolean(topicId),
    },
  )

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()

      // click the submit button
      const submitButton = document.getElementById("chat-submit")
      if (submitButton) {
        submitButton.click()
      }
    } else if (
      e.key === "Tab" &&
      activeTopicData.isSuccess &&
      activeTopicData.data.sparkline &&
      !Boolean(input) &&
      messages.length === 0
    ) {
      e.preventDefault()
      handleInputChange({
        target: {
          value: `${activeTopicData.data.sparkline} `,
        },
      } as any)
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      const element = textareaRef.current
      element.style.height = "auto"
      element.style.height = Math.min(element.scrollHeight, 200) + "px"
    }
  }, [input])

  return (
    <CardFooter className="pb-2 pr-1">
      {topicId && activeGuideline && (
        <form
          className="relative flex w-full items-end gap-4 rounded bg-muted p-2 pl-3 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
          onSubmit={handleParallelSubmit}
        >
          {messages.length > 0 && (
            <>
              {isLoading ? (
                <div className="absolute -top-16 right-0 flex justify-end bg-transparent pr-3">
                  <Button variant={"outline"} onClick={stop} className="bg-background">
                    Stop
                    <SquareIcon className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="absolute -top-16 left-1/2 flex -translate-x-1/2 transform gap-4 bg-transparent pr-3">
                  <GuidelineActions messages={messages} handleRevisionComplete={handleRevisionComplete} />
                  <Button
                    type="button"
                    variant={"outline"}
                    onClick={() => setMessages([])}
                    className="w-48 bg-background"
                  >
                    Clear
                    <EraserIcon className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              className="h-auto w-full w-full resize-none bg-transparent outline-none"
              style={{
                bottom: `${textareaRef?.current?.scrollHeight}px`,
                maxHeight: "200px",
                overflow: `${textareaRef.current && textareaRef.current.scrollHeight > 200 ? "auto" : "hidden"}`,
              }}
              placeholder={
                activeGuideline &&
                activeGuideline.value &&
                activeTopicData.isSuccess &&
                activeTopicData.data.sparkline &&
                messages.length === 0
                  ? `Test the guideline, e.g. "${activeTopicData.data.sparkline ?? ""}"`
                  : "Test the guideline..."
              }
              rows={1}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              id={CHAT_FOOTER_INPUT_ID}
              disabled={!topicId || !activeGuideline || !Boolean(activeGuideline.value)}
            />
          </div>
          <Button
            size={"sm"}
            disabled={
              !Boolean(input) || !topicId || (activeGuideline !== null && activeGuideline.value === "NA") || isLoading
            }
            type="submit"
            id="chat-submit"
          >
            {isLoading ? <SmallSpinner className="h-4 w-4" /> : <SendIcon className="h-5 w-5" />}
          </Button>
        </form>
      )}
    </CardFooter>
  )
}
