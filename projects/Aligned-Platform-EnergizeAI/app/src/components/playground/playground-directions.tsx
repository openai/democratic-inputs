import { SidebarCloseIcon, SidebarOpen } from "lucide-react"
import { useState } from "react"

import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator"
import { cn } from "@/lib/utils"

export const PlaygroundDirections = () => {
  const [isOpen, setIsOpen] = useState(true)

  const goals = [
    "Understand areas of weakness with the current Constitution",
    "Propose new, helpful guidelines if they don't exist",
    "Vote on already proposed ones if they do exist",
  ]

  const goalsList = goals.map((goal) => <li key={goal}>{goal}</li>)

  return (
    <Card className={cn(isOpen ? "max-w-sm" : "max-w-none", "transition-all duration-300 ease-in-out")}>
      <CardHeader className="flex-row items-center justify-between">
        {isOpen && <>Hey there! 👋</>}
        <Button variant={"ghost"} size={"sm"} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <SidebarCloseIcon className="h-4 w-4" /> : <SidebarOpen className="h-4 w-4" />}
        </Button>
      </CardHeader>
      {isOpen && (
        <CardContent className="flex flex-col gap-4">
          <CardTitle>Directions</CardTitle>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut pellentesque magna ultricies, vehicula augue sit
          amet, congue leo. Integer ipsum mi, aliquet eu facilisis eu, mattis ac metus. Cras viverra ornare volutpat.
          Aenean vitae ante ut nulla eleifend vestibulum eu vel magna. Quisque tincidunt in risus eget posuere. Nulla
          nec feugiat nunc. Sed id commodo felis, a tempus arcu. Nulla pulvinar aliquet facilisis.
          <Separator className="my-4" />
          <CardTitle>Your Goals:</CardTitle>
          <ol className="list-decimal pl-5">{goalsList}</ol>
        </CardContent>
      )}
    </Card>
  )
}
