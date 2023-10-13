import { cn } from "@/lib/utils"

type Props = {
  className?: string
}

export const SmallSpinner = ({ className }: Props) => {
  return (
    <svg
      className={cn("h-5 w-5 animate-spin text-foreground", className !== undefined && className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
    </svg>
  )
}
