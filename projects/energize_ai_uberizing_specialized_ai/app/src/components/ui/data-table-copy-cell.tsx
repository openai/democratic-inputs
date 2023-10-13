import { CheckIcon, CopyIcon } from "lucide-react"
import { useState } from "react"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip"

type Props = {
  value: string | null
}

export const DataTableCopyCell = ({ value }: Props) => {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value ?? "")
    setCopied(true)
    setOpen(true)

    setTimeout(() => {
      setCopied(false)
      setOpen(false)
    }, 1500)
  }

  return (
    <TooltipProvider delayDuration={0} skipDelayDuration={0}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <button className="cursor-pointer" onClick={handleCopy}>
            {value}
          </button>
        </TooltipTrigger>
        <TooltipContent className="flex items-center gap-2">
          {copied ? "Copied" : "Click to copy"}
          {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
