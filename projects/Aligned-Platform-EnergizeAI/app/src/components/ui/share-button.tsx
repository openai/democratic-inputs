import { Check, Copy, Twitter } from "lucide-react"
import { Upload } from "lucide-react"
import { useState } from "react"

import { Button } from "./button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu"

type Props = {
  className?: string
  callToAction?: string
  href?: string
}

export const ShareButton = ({
  className,
  callToAction = "Check this out on Aligned!",
  href = window.location.href,
}: Props) => {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = (e: Event) => {
    e.preventDefault()
    navigator.clipboard.writeText(href)

    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  const handleTwitterShare = () => {
    const base = "https://twitter.com/intent/tweet"
    const text = `${callToAction} ${href}`

    const url = `${base}?text=${encodeURIComponent(text)}`

    window.open(url, "_blank")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"outline"} className="w-full md:w-auto lg:w-auto">
          Share
          <Upload className="ml-2 inline-block h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" collisionPadding={20}>
        <DropdownMenuLabel>Choose platform</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={handleTwitterShare}>
            <Twitter className="mr-2 h-4 w-4" />
            <span>Twitter</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleCopyLink}>
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                <span>Copy Link</span>
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
