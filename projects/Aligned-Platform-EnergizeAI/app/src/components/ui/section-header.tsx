import { cn } from "@/lib/utils"

type Props = {
  title: string
  description?: string
  children?: React.ReactNode
  variant?: "normal" | "large"
}

export const SectionHeader = ({ title, description, children, variant }: Props) => {
  return (
    <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="block">
        <h3
          className={cn("flex items-center text-lg font-medium", variant === "large" && "mb-2 text-3xl font-semibold")}
        >
          {title}
        </h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  )
}
