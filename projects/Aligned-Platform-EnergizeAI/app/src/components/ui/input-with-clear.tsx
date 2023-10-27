import { XIcon } from "lucide-react"
import * as React from "react"

import { Button } from "./button"
import { Input } from "./input"
import { cn } from "@/lib/utils"

export interface InputWithClearProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const InputWithClear = React.forwardRef<HTMLInputElement, InputWithClearProps>(({ className, type, ...props }, ref) => {
  const handleClear = () => {
    if (!props.value) return
    if (!props.onChange) return

    props.onChange({ target: { value: "" } } as any)
  }

  return (
    <div
      className={cn(
        "flex max-w-md gap-3",
        "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-within:outline-none focus-within:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      <Input
        {...props}
        ref={ref}
        className="h-auto border-none px-0 py-0 pl-[1px] focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 focus-visible:ring-offset-transparent"
      />
      {props !== undefined && Boolean(props.value) && (
        <Button
          className="h-5 bg-transparent p-0 outline-none hover:bg-transparent focus:outline-none"
          onClick={handleClear}
        >
          <XIcon className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
})
InputWithClear.displayName = "Input With Clear"

export { InputWithClear }
