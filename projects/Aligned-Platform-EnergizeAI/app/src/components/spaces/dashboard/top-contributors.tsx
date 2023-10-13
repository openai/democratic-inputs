import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card"

export const TopContributors = () => {
  const data = [
    {
      name: "kennebrookes",
      gradient: `
        bg-gradient-to-r from-purple-400 via-pink-500 to-red-500
        dark:from-purple-600 dark:via-pink-600 dark:to-red-600
      `,
      points: 1172,
    },
    {
      name: "Idoe P.",
      gradient: `
        bg-gradient-to-r from-green-400 to-blue-500
        dark:from-green-600 dark:to-blue-600
      `,
      points: 678,
    },
    {
      name: "hallsky",
      gradient: `
        bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500
        dark:from-yellow-600 dark:via-red-600 dark:to-pink-600
      `,
      points: 493,
    },
    {
      name: "Hiroshi Tanaka",
      gradient: `
        bg-gradient-to-r from-purple-400 via-pink-500 to-red-500
        dark:from-purple-600 dark:via-pink-600 dark:to-red-600
      `,
      points: 489,
    },
  ]
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Top Contributors <span className="ml-2">🔥</span>
        </CardTitle>
        <CardDescription>1000+ people gave feedback this month!</CardDescription>
      </CardHeader>
      <CardContent className="-mt-2">
        {data.map((contributor, index) => (
          <div key={index} className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <div className={`h-8 w-8 rounded-full ${contributor.gradient}`}></div>
              <div className="ml-2">{contributor.name}</div>
            </div>
            <div className="text-gray-500">{contributor.points} points</div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
