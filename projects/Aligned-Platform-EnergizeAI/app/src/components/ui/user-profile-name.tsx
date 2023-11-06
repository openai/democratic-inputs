import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
  variant?: "small" | "large"
  data: {
    firstName?: string
    lastName?: string
    username?: string
    imageUrl?: string
  }
}

export const UserProfileName = (props: Props) => {
  const data = props.data

  return (
    <div className={props.className}>
      <div className="flex items-center gap-4">
        <Avatar className={cn("h-8 w-8", props.variant === "small" && "h-6 w-6")}>
          <AvatarImage src={data?.imageUrl} alt={`@${data?.username}`} />
          <AvatarFallback>
            {data?.firstName && data?.lastName
              ? data?.firstName.charAt(0) + data?.lastName.charAt(0)
              : data?.username
              ? data?.username.charAt(0)
              : null}
          </AvatarFallback>
        </Avatar>
        <span className="whitespace-nowrap">
          {data?.firstName && data?.lastName ? (
            <>
              {data?.firstName} {data?.lastName}
            </>
          ) : (
            data?.username
          )}
        </span>
      </div>
    </div>
  )
}
