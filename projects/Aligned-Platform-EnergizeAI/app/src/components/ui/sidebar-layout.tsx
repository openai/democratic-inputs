import { SidebarCloseIcon, SidebarOpenIcon } from "lucide-react"
import { ReactNode } from "react"

import { Button } from "./button"
import { Separator } from "./separator"
import { SidebarNav, SidebarNavItem } from "./sidebar-nav"
import useQueryState from "@/lib/use-query-state"
import { cn } from "@/lib/utils"

type Props = {
  children: ReactNode
  sidebarNavItems: SidebarNavItem[]
  title?: string
  description?: string
  withHeader?: boolean
}

export const SidebarLayout = ({ children, sidebarNavItems, title, description, withHeader = true }: Props) => {
  const [isCollapsed, setIsCollapsed] = useQueryState<boolean>("collapse_sidebar", {
    defaultValue: false,
    serialize: (value) => (value ? "true" : "false"),
    deserialize: (value) => value === "true",
  })

  return (
    <div className="mx-auto h-full max-w-7xl space-y-6">
      {withHeader && title && description && (
        <>
          <div>
            <h3 className="text-xl font-medium lg:text-2xl">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </div>
          <Separator />
        </>
      )}
      <div className="flex h-full flex-col space-y-8 transition-width duration-200 ease-in-out lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside
          className={cn(
            !isCollapsed && "min-w-[200px] lg:-mx-4 lg:w-1/5",
            isCollapsed && "flex flex-col lg:w-[20px]",
            "transition-width duration-200 ease-in-out",
          )}
        >
          {!isCollapsed ? (
            <>
              <SidebarNav items={sidebarNavItems} />
              <Button
                variant="ghost"
                className="float-right mt-10 hidden w-min px-2 lg:block"
                onClick={() => setIsCollapsed(true)}
              >
                <SidebarCloseIcon className="h-6 w-6" />
              </Button>
            </>
          ) : (
            <Button variant="ghost" className="float-right w-min px-2" onClick={() => setIsCollapsed(false)}>
              <SidebarOpenIcon className="h-6 w-6" />
            </Button>
          )}
        </aside>
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-hidden">{children}</div>
      </div>
    </div>
  )
}
