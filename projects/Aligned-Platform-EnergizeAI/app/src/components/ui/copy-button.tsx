import { CheckIcon, CopyIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "./button"
import { useToast } from "./use-toast"
import { cn } from "@/lib/utils"

type Props = {
  text: string
  className?: string
}

export const CopyButton = ({ text, className }: Props) => {
  const [copied, setCopied] = useState(false)

  const { toast } = useToast()

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)

    toast({
      title: "Copied",
      description: "Copied to clipboard",
    })

    setTimeout(() => setCopied(false), 1000)
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleCopy}
      className={cn("flex items-center gap-1", className)}
      disabled={copied}
    >
      {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
    </Button>
  )
}
