import { CheckIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Separator } from "../../ui/separator"
import { HandRaisedIcon } from "@heroicons/react/24/outline"

export const KeyData = () => {
  const resolved = (
    <Card className="border-none p-0 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0">
        <CardTitle className="text-sm font-medium">Resolutions</CardTitle>
        <CheckIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="text-2xl font-bold">+150</div>
        <p className="text-xs text-muted-foreground">Improvements made via community feedback!</p>
      </CardContent>
    </Card>
  )

  const totalPoints = (
    <Card className="border-none p-0 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0">
        <CardTitle className="text-sm font-medium">Total Points</CardTitle>
        <HandRaisedIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="text-2xl font-bold">+2350</div>
        <p className="text-xs text-muted-foreground">+180.1%, people are here to make an impact!</p>
      </CardContent>
    </Card>
  )

  const other = (
    <Card className="border-none p-0 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0">
        <CardTitle className="text-sm font-medium">Total Points</CardTitle>
        <HandRaisedIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="text-2xl font-bold">+2350</div>
        <p className="text-xs text-muted-foreground">+180.1%, people are here to make an impact!</p>
      </CardContent>
    </Card>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Key Data <span className="ml-2">🔢</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {resolved}
        <Separator />
        {totalPoints}
        <Separator />
        {other}
      </CardContent>
    </Card>
  )
}
