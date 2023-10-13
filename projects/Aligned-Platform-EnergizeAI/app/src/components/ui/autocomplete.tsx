"use client"

import { Command as CommandPrimitive } from "cmdk"
import { Check } from "lucide-react"
import { type KeyboardEvent, useCallback, useRef, useState } from "react"

import { Input } from "./input"
import { Skeleton } from "./skeleton"
import { CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

type AutoCompleteProps = {
  options: string[]
  emptyMessage: string
  value?: string
  onValueChange?: (value: string) => void
  onBlur?: () => void
  isLoading?: boolean
  disabled?: boolean
  placeholder?: string
}

export const AutoComplete = ({
  options,
  placeholder,
  emptyMessage,
  value,
  onValueChange,
  onBlur,
  disabled,
  isLoading = false,
}: AutoCompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const [isOpen, setOpen] = useState(false)

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current
      if (!input) {
        return
      }

      // Keep the options displayed when the user is typing
      if (!isOpen) {
        setOpen(true)
      }

      // This is not a default behaviour of the <input /> field
      if (event.key === "Enter" && input.value !== "") {
        const optionToSelect = options.find((option) => option === input.value)
        if (optionToSelect) {
          onValueChange?.(optionToSelect)
        }
      }

      if (event.key === "Escape") {
        input.blur()
      }
    },
    [isOpen, options, onValueChange],
  )

  const handleSelectOption = useCallback(
    (selectedOption: string) => {
      onValueChange?.(selectedOption)

      // This is a hack to prevent the input from being focused after the user selects an option
      // We can call this hack: "The next tick"
      setTimeout(() => {
        inputRef?.current?.blur()
      }, 0)
    },
    [onValueChange],
  )

  return (
    <CommandPrimitive onKeyDown={handleKeyDown}>
      <div>
        <CommandInput
          ref={inputRef}
          value={value}
          onValueChange={isLoading ? undefined : onValueChange}
          showSearch={false}
          className="rounded-md border"
          onBlur={() => {
            setOpen(false)
            onBlur?.()
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>
      <div className="relative mt-1">
        {isOpen && (isLoading || options.length > 0) ? (
          <div className="absolute top-0 z-10 w-full rounded-md rounded-xl bg-background outline-none animate-in fade-in-0 zoom-in-95">
            <CommandList className="rounded-lg ring-1 ring-slate-200">
              {isLoading ? (
                <CommandPrimitive.Loading>
                  <div className="p-1">
                    <Skeleton className="h-8 w-full" />
                  </div>
                </CommandPrimitive.Loading>
              ) : null}
              {options.length > 0 && !isLoading ? (
                <CommandGroup>
                  {options.map((option) => {
                    const isSelected = value === option && value
                    return (
                      <CommandItem
                        key={option}
                        value={option}
                        onMouseDown={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                        }}
                        onSelect={() => handleSelectOption(option)}
                        className={cn("flex w-full items-center gap-2", !isSelected ? "pl-8" : null)}
                      >
                        {isSelected ? <Check className="w-4" /> : null}
                        {option}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              ) : null}
            </CommandList>
          </div>
        ) : null}
      </div>
    </CommandPrimitive>
  )
}
