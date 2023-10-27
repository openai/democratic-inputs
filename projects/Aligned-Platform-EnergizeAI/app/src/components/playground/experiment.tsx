import { Message } from "ai"
import { ArrowLeftIcon } from "lucide-react"
import { FormEvent, useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid"

import { useToast } from "../ui/use-toast"
import { ActiveGuideline } from "./experiment.active-guideline"
import { ChatFooter } from "./experiment.chat-footer"
import { ExperimentMessage } from "./experiment.message"
import { SuggestPrompt } from "./experiment.suggest-prompt"
import { Card, CardContent } from "@/components/ui/card"
import { energizeEngine, getBaseEnergizeEngineUrl } from "@/lib/energize-engine"
import useStreamTextDataFromApi from "@/lib/use-stream-text-data-from-api"
import { usePlaygroundStore } from "@/store/playground-store"
import { useAuth } from "@clerk/clerk-react"
import { useChat } from "ai/react"
import { useRouter } from "next/router"

export const Experiment = () => {
  const { topicId, activeGuideline, setActiveGuidelineLoading, triggerClearMessages, setTriggerClearMessages } =
    usePlaygroundStore()
  const { space_id } = useRouter().query
  const [controlResponse, setControlResponse] = useState<string>("")
  const streamTextDataFromApi = useStreamTextDataFromApi()
  const { getToken } = useAuth()
  const [chatId, setChatId] = useState<string>(uuidv4())

  console.log("rendering experiment.tsx")

  const { messages, input, handleInputChange, handleSubmit, isLoading, stop, setMessages, setInput } = useChat({
    api: `${getBaseEnergizeEngineUrl()}/api/playground/route`,
    body: {
      activeGuideline,
      chatId,
      topicId,
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const [isGeneratingControl, setIsGeneratingControl] = useState<boolean>(false)
  const handleGenerateControl = async (prompt: string, currentMessages: Message[]) => {
    if (!prompt || isGeneratingControl || !activeTopicData.isSuccess) return
    setIsGeneratingControl(true)

    // make sure there is no system prompt
    // get rid of createdAt and id
    const filtered = currentMessages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => {
        const { createdAt, id, ...rest } = m
        return rest
      })

    const body = {
      messages: [
        ...filtered,
        {
          role: "user",
          content: prompt,
        },
      ],
      controlResponse: true,
      chatId,
      topicId,
    }

    await streamTextDataFromApi({
      body,
      apiUrl: "/api/playground/route",
      onMessage: (data) => {
        setControlResponse(data)
      },
      onError: (errorMessage) => {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      },
      onFinally: () => {
        setIsGeneratingControl(false)
        setActiveGuidelineLoading(false)
      },
    })
  }

  useEffect(() => {
    if (triggerClearMessages) {
      setChatId(uuidv4())
      setMessages([])
      setTriggerClearMessages(false)
    }
  }, [triggerClearMessages])

  const handleParallelSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const curInput = input
    const curMessages = [...messages]

    setControlResponse("")

    const token = await getToken()

    await Promise.all([
      handleGenerateControl(curInput, curMessages),
      handleSubmit(e, {
        options: {
          body: {
            activeGuideline,
            chatId,
            topicId,
          },
          headers: {
            Authorization: `Bearer ${token}`,
            ["X-Api-Key"]: process.env.NEXT_PUBLIC_ENERGIZE_ENGINE_KEY as string,
          },
        },
      }),
    ])
  }

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

  const handleRevisionComplete = () => {
    if (messages.length > 0) {
      const lastUserMessage = messages[messages.length - 2]
      setInput(lastUserMessage.content)

      const revertedMessages = messages.slice(0, messages.length - 2)
      setMessages(revertedMessages)

      setTimeout(() => {
        // click the submit button
        const submitButton = document.getElementById("chat-submit")
        if (submitButton) {
          submitButton.click()
        }
      }, 200)
    }
  }

  return (
    <div className="flex h-full flex-1 flex-col gap-4">
      <Card className="flex h-full flex-1 flex-col rounded-none border-0 py-0 shadow-none lg:border-l-[1px]">
        <ActiveGuideline />
        <CardContent className="flex-1 overflow-y-auto pr-0">
          {!topicId ? (
            <div className="flex h-full w-full flex-col items-center justify-center text-center leading-loose">
              Hey! 👋 <span className="mx-1"></span>
            </div>
          ) : !activeGuideline ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
              <p>Awesome 🎉</p>
              <p>
                <u>Click</u> a guideline card to test+review, or <u>propose</u> your own!
              </p>
              <ArrowLeftIcon className="inline-block h-4 w-4" />
            </div>
          ) : messages.length === 0 ? (
            <SuggestPrompt setInput={setInput} />
          ) : (
            <div className="space-y-6 pb-16">
              {messages.map((m, ix) => (
                <ExperimentMessage
                  key={m.id}
                  m={m}
                  ix={ix}
                  messages={messages}
                  isLoading={isLoading}
                  controlResponse={controlResponse}
                />
              ))}
            </div>
          )}
        </CardContent>
        <ChatFooter
          messages={messages}
          setMessages={setMessages}
          handleParallelSubmit={handleParallelSubmit}
          input={input}
          handleInputChange={handleInputChange}
          isLoading={isLoading}
          stop={stop}
          handleRevisionComplete={handleRevisionComplete}
        />
      </Card>
    </div>
  )
}
