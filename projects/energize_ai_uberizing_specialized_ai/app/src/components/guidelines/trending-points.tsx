import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Label } from "../ui/label"
import { cn } from "@/lib/utils"

export const TrendingPoints = () => {
  const data = [
    {
      title: "Politics > Elections > Candidates",
      author: "Idoe P.",
      gradient: `
        bg-gradient-to-r from-green-400 to-blue-500
        dark:from-green-600 dark:to-blue-600
      `,
      otherContributors: 145,
      against: 0.24,
      neutral: 0.09,
      comments: 65,
      votes: 80,
    },
    {
      title: "Politics > Propoganda > Misinformation",
      author: "Hiroshi Tanaka",
      gradient: `
        bg-gradient-to-r from-purple-400 via-pink-500 to-red-500
        dark:from-purple-600 dark:via-pink-600 dark:to-red-600
      `,
      otherContributors: 545,
      against: 0.12,
      neutral: 0.2,
      comments: 15,
      votes: 530,
    },
    {
      title: "Self-Harm > Suicide > Methods",
      author: "hallsky",
      gradient: `
        bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500
        dark:from-yellow-600 dark:via-red-600 dark:to-pink-600
      `,
      otherContributors: 442,
      against: 0.32,
      neutral: 0.19,
      comments: 42,
      votes: 400,
    },
  ]
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Trending Topics <span className="ml-2">📈</span>
        </CardTitle>
        <CardDescription>Explore what people care about the most.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.map((point, index) => (
          <div
            key={index}
            className={cn("flex items-start justify-between py-4", index !== data.length - 1 && "border-b")}
          >
            <div className="flex flex-col gap-4">
              <h1>{point.title}</h1>
              <Label className="flex items-center gap-2 text-muted-foreground">
                First reported by
                <div className={`h-5 w-5 rounded-full ${point.gradient}`}></div>
                {point.author} on 12/12/2021
              </Label>
              <Label className="text-muted-foreground">
                {point.comments} points, {point.votes} votes, ...
              </Label>
            </div>
            <div className="flex flex-col gap-4 object-right">
              {point.otherContributors} contributors
              <Label className="flex flex-col items-end gap-2 text-xs text-muted-foreground">
                <div className="flex h-3 w-[190px] w-full rounded-full bg-gradient-to-r from-emerald-300 to-teal-300 dark:from-emerald-600 dark:to-teal-950">
                  <div
                    className={`h-full w-1/2 rounded-full rounded-r-none bg-gradient-to-r from-red-400 to-rose-400 dark:from-red-800 dark:to-rose-700`}
                    style={{ width: `${point.against * 100}%` }}
                  ></div>
                  <div
                    className={`h-full w-1/2 rounded-none bg-gradient-to-r from-blue-400 to-sky-400 dark:from-blue-700 dark:to-sky-700`}
                    style={{ width: `${point.neutral * 100}%` }}
                  ></div>
                </div>
                {100 - point.neutral * 100}% consensus
              </Label>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
