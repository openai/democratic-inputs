import { ReactNode } from "react"

import { SidebarLayout } from "../ui/sidebar-layout"
import { Paths } from "@/lib/paths"
import { useRouter } from "next/router"

type Props = {
  children: ReactNode
}

export const ContributionsLayout = ({ children }: Props) => {
  const router = useRouter()
  const { space_id } = router.query

  const sidebarNavItems = [
    {
      title: "My Guidelines",
      href: Paths.MyGuidelines,
    },
    {
      title: "My Ratings",
      href: Paths.MyRatings,
    },
  ].map((item) => ({
    ...item,
    href: item.href.replace(":id", space_id as string),
  }))

  return <SidebarLayout sidebarNavItems={sidebarNavItems}>{children}</SidebarLayout>
}
