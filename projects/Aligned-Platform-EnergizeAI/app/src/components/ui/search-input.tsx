import { SearchIcon, XIcon } from "lucide-react"
import * as React from "react"

import { Button } from "./button"
import { Input } from "./input"
import { SmallSpinner } from "./small-spinner"
import { cn } from "@/lib/utils"

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  customIcon?: React.ReactNode
  isLoading?: boolean
  kbd?: string
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(({ className, type, ...props }, ref) => {
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
      {props.customIcon ? props.customIcon : <SearchIcon className="h-5 w-5" />}
      <Input
        {...props}
        ref={ref}
        className="h-auto border-none px-0 py-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 focus-visible:ring-offset-transparent"
        placeholder={props.placeholder ?? "Search..."}
      />
      {props.isLoading ? (
        <SmallSpinner className="h-5 w-5 text-muted-foreground" />
      ) : props !== undefined && Boolean(props.value) ? (
        <>
          <Button
            className="h-5 bg-transparent p-0 outline-none hover:bg-transparent focus:outline-none"
            onClick={handleClear}
          >
            <XIcon className="h-5 w-5 text-muted-foreground" />
          </Button>
          {props.kbd && (
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              Enter
            </kbd>
          )}
        </>
      ) : null}
    </div>
  )
})
SearchInput.displayName = "Search Input"

export { SearchInput }
