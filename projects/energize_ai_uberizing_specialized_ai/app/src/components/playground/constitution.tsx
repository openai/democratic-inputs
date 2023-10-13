import { ArrowUp, SidebarClose, SidebarOpenIcon } from "lucide-react"
import { useEffect } from "react"

import { TopicTreeMenu } from "../topics/topic-tree-menu"
import { NeedsYourHelp } from "./constitution.needs-help"
import { ConstitutionPropose } from "./constitution.propose"
import { Button } from "@/components/ui/button"
import { energizeEngine } from "@/lib/energize-engine"
import { Paths, SEARCH_PARAM_KEYS } from "@/lib/paths"
import useQueryState from "@/lib/use-query-state"
import { cn, removeSearchParam } from "@/lib/utils"
import { usePlaygroundStore } from "@/store/playground-store"
import { useRouter } from "next/router"

export const Constitution = () => {
  const { topicId, setSeenGuidelineIds, seenGuidelineIds } = usePlaygroundStore()
  const { space_id } = useRouter().query
  const [open, setOpen] = useQueryState<boolean>(SEARCH_PARAM_KEYS[Paths.Playground].openConstitution, {
    defaultValue: true,
    serialize: (value) => (value ? "true" : "false"),
    deserialize: (value) => value === "true",
  })
  const { setTopicId, setActiveGuideline, setActiveType } = usePlaygroundStore()

  useEffect(() => {
    setSeenGuidelineIds([])
  }, [topicId])

  useEffect(() => {
    setOpen(true)
  }, [seenGuidelineIds])

  const activeTopicData = energizeEngine.topics.getTopicWithTreePath.useQuery(
    {
      spaceId: space_id as string,
      topicId: topicId ?? "",
    },
    {
      enabled: Boolean(topicId),
    },
  )

  return (
    <div
      className={cn(
        "max-h-full transition-width duration-200 ease-in-out",
        open && "flex w-[400px] flex-col gap-4 overflow-y-auto pr-1",
        !open && "-mr-2 w-[35px]",
      )}
    >
      {!open ? (
        <Button
          variant={"ghost"}
          onClick={() => setOpen(true)}
          className="h-8 w-8 rounded-full bg-blue-500 p-0 text-white"
        >
          <SidebarOpenIcon className="h-5 w-5" />
        </Button>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <TopicTreeMenu
              currentTopicId={topicId}
              handleNewTopicId={(topicId: string) => {
                setActiveGuideline(null)
                setTopicId(topicId)
                setActiveType(0)
              }}
            />
            {activeTopicData.isSuccess && (
              <Button variant={"ghost"} onClick={() => setOpen(false)} className="ml-2 h-8 w-8 p-0">
                <SidebarClose className="h-5 w-5" />
              </Button>
            )}
          </div>
          {topicId ? (
            <div className="flex flex-col gap-4 overflow-x-visible pl-2">
              <NeedsYourHelp setOpen={setOpen} />
              <ConstitutionPropose setOpen={setOpen} />
            </div>
          ) : (
            <div className="flex h-full flex-1 flex-col items-center justify-center gap-2 border border-dashed py-16 text-center text-sm">
              <ArrowUp className="h-5 w-5" />
              Choose a topic to start
            </div>
          )}
        </>
      )}
    </div>
  )
}
