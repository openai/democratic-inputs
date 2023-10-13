import { Card, CardDescription, CardHeader, CardTitle } from "./card"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
}

export const SkeletonCard = ({ className }: Props) => {
  return (
    <Card className={cn("w-full animate-pulse", className)}>
      <CardHeader>
        <CardTitle className="h-4 w-1/2 rounded bg-muted" />
        <CardDescription className="h-4 w-full rounded bg-muted" />
        <CardDescription className="h-4 w-full rounded bg-muted" />
      </CardHeader>
    </Card>
  )
}
