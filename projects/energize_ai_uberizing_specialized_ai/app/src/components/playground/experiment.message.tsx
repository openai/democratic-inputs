import { Message } from "ai"

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { cn } from "@/lib/utils"
import { useUser } from "@clerk/clerk-react"

type Props = {
  m: Message
  ix: number
  messages: Message[]
  controlResponse: string | undefined
  isLoading: boolean
}

export const ExperimentMessage = ({ m, ix, messages, controlResponse, isLoading }: Props) => {
  const user = useUser()

  return (
    <div className={cn("flex gap-2")} key={m.id}>
      {m.role === "user" ? (
        <Avatar className="h-6 w-6">
          <AvatarImage src={user.user?.imageUrl} alt="@shadcn" />
          <AvatarFallback>SC</AvatarFallback>
        </Avatar>
      ) : (
        <img src="/logo.png" alt="Logo" className="h-6 text-primary-foreground" />
      )}
      <div
        className={cn(
          "flex flex-1 flex-col gap-2",
          ix === messages.length - 1 && m.role === "assistant" && "grid grid-cols-2 justify-between",
        )}
      >
        <div>
          <b>{m.role === "assistant" && "With Guideline"}</b>
          {m.role === "assistant" && ": "}
          <span className="whitespace-pre-line">{m.content}</span>
          {ix === messages.length - 1 && m.role === "assistant" && isLoading && !Boolean(m.content) && (
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          )}
        </div>
        {ix === messages.length - 1 && m.role === "assistant" && controlResponse && (
          <div className="ml-4 border-l pl-6">
            <b>ChatGPT</b>
            :&nbsp;
            <span className="whitespace-pre-line">{controlResponse ?? "..."}</span>
          </div>
        )}
      </div>
    </div>
  )
}
