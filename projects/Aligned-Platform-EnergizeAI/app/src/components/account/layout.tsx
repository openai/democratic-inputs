import { ReactNode } from "react"

import { SidebarLayout } from "../ui/sidebar-layout"
import { Paths } from "@/lib/paths"

type Props = {
  children: ReactNode
}

const sidebarNavItems = [
  {
    title: "My Profile",
    href: Paths.Profile,
  },
  {
    title: "Demographics",
    href: Paths.Demographics,
  },
]

export const AccountLayout = ({ children }: Props) => {
  return <SidebarLayout sidebarNavItems={sidebarNavItems}>{children}</SidebarLayout>
}
