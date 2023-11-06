import { CheckCircle, CircleDotIcon } from "lucide-react"

import { ProlificCompletionDialog } from "../prolific/prolific-completion-dialog"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Progress } from "../ui/progress"
import QueryDataLoader from "../ui/query-data-loader"
import { Skeleton } from "../ui/skeleton"
import { energizeEngine } from "@/lib/energize-engine"
import { cn } from "@/lib/utils"
import { useAuth } from "@clerk/clerk-react"
import { useRouter } from "next/router"

export const TasksDropdown = () => {
  const { space_id } = useRouter().query
  const tasksQuery = energizeEngine.tasks.getPilotTasksProgress.useQuery(
    {
      spaceId: space_id as string,
    },
    {
      enabled: space_id !== undefined,
    },
  )
  const { userId } = useAuth()

  const prolificQuery = energizeEngine.prolific.getProlificPidForCurrentUser.useQuery(
    {
      spaceId: space_id as string,
    },
    {
      enabled: Boolean(space_id),
      retry: false,
    },
  )

  const activeTask = (tasksQuery.data ?? []).find((task) => !task.completed)
  const activeTaskOrder = activeTask?.order ?? 0

  const completionCode = energizeEngine.prolific.getCompletionCodeForStudy.useQuery(
    {
      spaceId: space_id as string,
      studyId: prolificQuery.data?.studyId ?? "",
    },
    {
      enabled: Boolean(prolificQuery.data?.studyId) && !activeTask,
    },
  )

  if (!userId || !space_id) {
    return null
  }

  if (!tasksQuery.isLoading && !activeTask) {
    if (prolificQuery.isLoading) {
      return <Skeleton className="h-8 w-32" />
    }

    if (!prolificQuery.data?.prolificPid) {
      return null
    }

    if (completionCode.isLoading) {
      return <Skeleton className="h-8 w-32" />
    }

    if (!completionCode.data) {
      return null
    }

    return (
      <QueryDataLoader queryResults={prolificQuery} skeletonItems={1}>
        <QueryDataLoader.IsSuccess>
          <ProlificCompletionDialog code={completionCode.data} />
        </QueryDataLoader.IsSuccess>
        <QueryDataLoader.IsLoading>
          <Skeleton className="h-8 w-32" />
        </QueryDataLoader.IsLoading>
      </QueryDataLoader>
    )
  }

  return (
    <QueryDataLoader queryResults={tasksQuery} skeletonItems={1}>
      <QueryDataLoader.IsSuccess>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="-mr-2 flex flex-col items-start justify-center gap-2 px-2 py-0">
              <span className="text-xs">TODO: {activeTask?.title} 🚀</span>
              <Progress value={activeTask?.progress} className="h-2 w-48" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="center" forceMount>
            <DropdownMenuLabel className="font-normal">Pilot Tasks</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(tasksQuery.data ?? []).map((task) => (
              <DropdownMenuItem
                key={task.title + "dropdown"}
                className={cn("flex-col items-start gap-2", activeTaskOrder < task.order && "opacity-30")}
              >
                <div className="flex items-center">
                  {activeTaskOrder > task.order ? (
                    <CheckCircle className="mr-2 h-4 w-4 text-success" />
                  ) : activeTaskOrder === task.order ? (
                    <CircleDotIcon className="dark:amber-700 mr-2 h-4 w-4 text-amber-400" />
                  ) : (
                    <CircleDotIcon className="mr-2 h-4 w-4 text-slate-400 dark:text-slate-800" />
                  )}
                  {task.title}
                </div>
                {activeTaskOrder === task.order && <span className="ml-6">Progress: ({task.progress}%)</span>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </QueryDataLoader.IsSuccess>
      <QueryDataLoader.IsLoading>
        <Skeleton className="h-8 w-32" />
      </QueryDataLoader.IsLoading>
    </QueryDataLoader>
  )
}
