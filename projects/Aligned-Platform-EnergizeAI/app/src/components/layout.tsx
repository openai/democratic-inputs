import { pathToRegexp } from "path-to-regexp"
import { ReactNode } from "react"

import { MainNav } from "./nav/main-nav"
import { Banner } from "./ui/banner"
import { Paths } from "@/lib/paths"
import { usePathname } from "next/navigation"

type Props = {
  children: ReactNode
}

export const Layout = ({ children }: Props) => {
  const pathname = usePathname()

  const banners = [
    {
      title: "Aligned is in beta!",
      description: "Try our new ChatGPT Plugin for instant sharing with the community",
      linkHref: "https://chat.openai.com/?model=gpt-4-plugins",
      linkText: "Try it out",
      pathname: "/deleted",
    },
  ]

  const bannerItems = banners.map((banner) => {
    if (banner.pathname !== pathname) return undefined

    return (
      <Banner
        key={banner.title}
        title={banner.title}
        description={banner.description}
        linkHref={banner.linkHref}
        linkText={banner.linkText}
      />
    )
  })

  const fullScreenPaths = [Paths.Playground, Paths.Export]

  const isFullScreen =
    fullScreenPaths.find((path) => {
      const re = pathToRegexp(path)
      const match = re.exec(pathname)

      return match !== null
    }) !== undefined

  if (isFullScreen) {
    return (
      <>
        <div className="flex h-screen w-screen flex-col overflow-hidden bg-background">
          {bannerItems}
          <MainNav />
          <div className="flex-1 overflow-y-hidden px-6 py-8 md:px-8 lg:px-10">{children}</div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="max-w-screen min-h-screen bg-background">
        {bannerItems}
        <MainNav />
        <div className="overflow-x-hidden px-6 py-8 md:px-8 lg:px-10">{children}</div>
      </div>
    </>
  )
}
