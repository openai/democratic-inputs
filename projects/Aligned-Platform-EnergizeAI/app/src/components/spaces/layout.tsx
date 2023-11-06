import { ReactNode } from "react"

import { SidebarLayout } from "../ui/sidebar-layout"

type Props = {
  children: ReactNode
}

const sidebarNavItems = [
  {
    title: "Public",
    href: "/spaces",
  },
  {
    title: "Membership",
    href: "/spaces/member-only",
  },
]

export const SpacesLayout = ({ children }: Props) => {
  return (
    <SidebarLayout sidebarNavItems={sidebarNavItems} title="Spaces" description="Explore spaces on Aligned.">
      {children}
    </SidebarLayout>
  )
}
