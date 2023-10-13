import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card"

export const SkeletonTopicCard = () => {
  return (
    <Card className="animate-pulse">
      <CardHeader className="flex flex-col gap-2">
        <CardTitle className="flex h-6 w-1/6 items-center gap-2 rounded bg-muted" />
        <CardDescription className="h-24 w-full rounded bg-muted" />
      </CardHeader>
    </Card>
  )
}
