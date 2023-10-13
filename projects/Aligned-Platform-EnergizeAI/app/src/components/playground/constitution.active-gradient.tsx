import { cn } from "@/lib/utils"

export const ConstitutionActiveGradient = () => {
  return (
    <div
      className={cn(
        "absolute -inset-[2px] rounded-lg bg-gradient-to-r opacity-75 blur-sm",
        "from-sky-300 to-green-300",
        "dark:from-sky-700 dark:to-green-700",
      )}
    />
  )
}
