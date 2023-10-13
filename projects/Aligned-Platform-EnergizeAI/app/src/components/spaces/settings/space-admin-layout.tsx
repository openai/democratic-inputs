import { DatabaseIcon, UsersIcon } from "lucide-react"
import { ReactNode } from "react"

import { SidebarLayout } from "@/components/ui/sidebar-layout"
import { SidebarNavItem } from "@/components/ui/sidebar-nav"
import { Paths } from "@/lib/paths"
import { EllipsisHorizontalCircleIcon, EllipsisVerticalIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/router"

type Props = {
  children: ReactNode
}

export const OrgAdminLayout = ({ children }: Props) => {
  const router = useRouter()
  const { space_id } = router.query

  const sidebarNavItems: SidebarNavItem[] = [
    {
      title: "Members",
      href: Paths.Members,
      header: "Users",
      headerIcon: <UsersIcon className="h-4 w-4" />,
    },
    {
      title: "Waitlist",
      href: Paths.SpaceWaitlist,
    },
    {
      title: "Taxonomy",
      header: "Setup",
      href: Paths.Taxonomy,
      headerIcon: <DatabaseIcon className="h-4 w-4" />,
    },
    {
      title: "Prompt Pool",
      href: Paths.PromptPool,
    },
    {
      title: "Guidelines",
      href: Paths.Guidelines,
    },
    {
      title: "Rating Tags",
      href: Paths.RatingTags,
    },
    {
      title: "Chat Logs",
      href: Paths.ChatMessages,
      header: "Monitor",
      headerIcon: <EllipsisHorizontalCircleIcon className="h-4 w-4" />,
    },
    {
      title: "API Keys",
      href: Paths.ApiKeys,
    },
    {
      title: "Export",
      href: Paths.Export,
    },
    {
      title: "Prolific",
      href: Paths.ProlificMembers,
    },
  ].map((item) => ({
    ...item,
    href: item.href.replace(":id", space_id as string),
  }))

  return <SidebarLayout sidebarNavItems={sidebarNavItems}>{children}</SidebarLayout>
}
