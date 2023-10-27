import { ArrowLeft, MoreHorizontal, PlusIcon, UserIcon } from "lucide-react"
import { useState } from "react"

import { OrgAdminLayout } from "@/components/spaces/settings/space-admin-layout"
import { TopicTreeMenu } from "@/components/topics/topic-tree-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import QueryDataLoader from "@/components/ui/query-data-loader"
import { SearchInput } from "@/components/ui/search-input"
import { Separator } from "@/components/ui/separator"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { SmallSpinner } from "@/components/ui/small-spinner"
import { useToast } from "@/components/ui/use-toast"
import { UserProfileName } from "@/components/ui/user-profile-name"
import { energizeEngine } from "@/lib/energize-engine"
import useDebounce from "@/lib/use-debounce"
import useQueryState from "@/lib/use-query-state"
import { cn } from "@/lib/utils"
import { useRouter } from "next/router"

const ChatMessagesPage = () => {
  const { space_id } = useRouter().query
  const [topicId, setTopicId] = useState<string | null>(null)
  const [activeChatMessageId, setActiveChatMessageId] = useQueryState<string | null>("active_chat_message_id", {
    defaultValue: null,
    pushStateInHistory: true,
  })
  const [lastSelectedChatMessageId, setLastSelectedChatMessageId] = useState<string | null>(null)
  const [search, setSearch] = useQueryState<string | undefined>("search", {
    defaultValue: undefined,
  })
  const searchQuery = useDebounce(search, 500)

  const { toast } = useToast()

  const createPromptMutation = energizeEngine.prompts.createPrompt.useMutation()
  const addPromptToPool = async (prompt: string, topicId: string) => {
    if (!prompt) return
    await createPromptMutation.mutate(
      {
        spaceId: space_id as string,
        value: prompt,
        topicId,
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Prompt added to pool",
            variant: "success",
          })
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          })
        },
      },
    )
  }

  const messageQuery = energizeEngine.chatMessages.getChatMessages.useInfiniteQuery(
    {
      limit: 10,
      topicId,
      search: searchQuery ?? null,
      spaceId: space_id as string,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  )

  const activeChatMessageQuery = energizeEngine.chatMessages.getChatMessageById.useQuery(
    {
      id: activeChatMessageId as string,
      spaceId: space_id as string,
    },
    {
      enabled: !!activeChatMessageId,
    },
  )

  const cards = messageQuery.data?.pages
    .map((page) => page.items)
    .flat()
    .map((chatMessage) => (
      <Card
        className={cn(
          "cursor-pointer transition-colors duration-150 hover:border-primary",
          lastSelectedChatMessageId === chatMessage.id && "bg-muted",
        )}
        key={chatMessage.id}
        onClick={() => {
          setActiveChatMessageId(chatMessage.id)
        }}
      >
        <CardHeader>
          <CardTitle>{chatMessage.guidelineValue}</CardTitle>
          <CardDescription className="flex justify-between pt-4">
            <UserProfileName
              data={{
                firstName: chatMessage.firstName ?? undefined,
                lastName: chatMessage.lastName ?? undefined,
                imageUrl: chatMessage.profileImageURL ?? undefined,
                username: chatMessage.username ?? undefined,
              }}
              variant="small"
            />
            Tested on {new Date(chatMessage.updatedAt).toLocaleString()}
          </CardDescription>
        </CardHeader>
      </Card>
    ))

  const nextButton = messageQuery.hasNextPage ? (
    <div className="flex justify-center">
      <Button
        variant={"secondary"}
        onClick={() => {
          messageQuery.fetchNextPage()
        }}
      >
        Load More
        {messageQuery.isFetchingNextPage && <SmallSpinner className="ml-2" />}
      </Button>
    </div>
  ) : null

  const activeChatMessageCard = activeChatMessageQuery.data ? (
    <Card>
      <CardHeader>
        <CardDescription className="flex items-center justify-between gap-4">
          <UserProfileName
            data={{
              firstName: activeChatMessageQuery.data.authorData.firstName ?? undefined,
              lastName: activeChatMessageQuery.data.authorData.lastName ?? undefined,
              username: activeChatMessageQuery.data.authorData.username ?? undefined,
              imageUrl: activeChatMessageQuery.data.authorData.imageUrl ?? undefined,
            }}
          />
          Tested on {new Date(activeChatMessageQuery.data.updatedAt).toLocaleString()}
        </CardDescription>
        <CardTitle className="py-4">{activeChatMessageQuery.data.guidelineValue}</CardTitle>
        <Separator />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {activeChatMessageQuery.data.messages
          .filter((m) => m.role !== "system")
          .map((m, ix) => (
            <div className={cn("flex gap-2")} key={ix + "message"}>
              {m.role === "user" ? (
                <Avatar className="h-6 w-6 text-sm">
                  <AvatarFallback>
                    <UserIcon className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <img src="/logo.png" alt="Logo" className="h-6 text-primary-foreground" />
              )}
              <div className={cn("flex flex-1 flex-col gap-2")}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="cursor-pointer">
                      <b>{m.role === "assistant" && "With Guideline"}</b>
                      {m.role === "assistant" && ": "}
                      <span className="whitespace-pre-line">{m.content}</span>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-background" align="start">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        if (!activeChatMessageQuery.data) return
                        addPromptToPool(m.content ?? "NA", activeChatMessageQuery.data.topicId)
                      }}
                    >
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Add to prompt pool
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  ) : null

  if (activeChatMessageId) {
    return (
      <OrgAdminLayout>
        <div className="flex flex-col gap-4">
          <Button
            variant={"ghost"}
            className="w-min px-2"
            onClick={() => {
              setLastSelectedChatMessageId(activeChatMessageId)
              setActiveChatMessageId(null)
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <QueryDataLoader queryResults={activeChatMessageQuery} skeletonItems={1}>
            <QueryDataLoader.IsSuccess>{activeChatMessageCard}</QueryDataLoader.IsSuccess>
            <QueryDataLoader.IsLoading>
              <SkeletonCard />
            </QueryDataLoader.IsLoading>
          </QueryDataLoader>
        </div>
      </OrgAdminLayout>
    )
  }

  return (
    <OrgAdminLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <SearchInput
            placeholder="Search for guideline..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
            }}
          />
          <TopicTreeMenu
            currentTopicId={topicId}
            handleNewTopicId={(topicId: string) => {
              setTopicId(topicId)
            }}
            className="max-w-sm flex-1 whitespace-nowrap"
          />
        </div>
        <QueryDataLoader
          queryResults={messageQuery}
          forceState={messageQuery.isSuccess && messageQuery.data.pages[0].items.length === 0 ? "empty" : undefined}
        >
          <QueryDataLoader.IsSuccess>
            {cards}
            {nextButton}
          </QueryDataLoader.IsSuccess>
        </QueryDataLoader>
      </div>
    </OrgAdminLayout>
  )
}

export default ChatMessagesPage
