import { CopyIcon, ShareIcon } from "lucide-react"
import { forwardRef, useImperativeHandle } from "react"

import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { useToast } from "../ui/use-toast"
import { energizeEngine } from "@/lib/energize-engine"
import { cn } from "@/lib/utils"

export type ShareDropdownProps = {
  shareUrl?: string
  className?: string
  children?: React.ReactNode
}

export type ShareDropdownRef = {
  handleShare: (link?: string) => void
}

const ShareDropdown = forwardRef<ShareDropdownRef, ShareDropdownProps>((props, ref) => {
  const { shareUrl, className, children } = props
  const shareMutation = energizeEngine.shortenedUrls.createShortenedUrl.useMutation()
  const { toast } = useToast()

  const handleShare = async (link?: string) => {
    await shareMutation.mutate(
      {
        url: link ?? shareUrl ?? window.location.href,
      },
      {
        onSuccess: (data) => {
          toast({
            title: "Link copied to clipboard!",
            description: "You can now share this link with your friends!",
            variant: "success",
          })

          const shareUrl = window.location.origin + "/s/" + data
          navigator.clipboard.writeText(shareUrl)
        },
        onError: (err) => {
          toast({
            title: "Error creating link",
            description: err.message,
            variant: "destructive",
          })
        },
      },
    )
  }

  useImperativeHandle(ref, () => ({
    handleShare,
  }))

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={"sm"} className={cn(className)}>
          <ShareIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        {!children ? (
          <DropdownMenuItem onClick={() => handleShare()}>
            <CopyIcon className="mr-2 h-4 w-4" />
            <span>Copy Link</span>
          </DropdownMenuItem>
        ) : (
          children
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

ShareDropdown.displayName = "ShareDropdown"

export { ShareDropdown }
