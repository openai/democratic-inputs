"use client"

import { buttonVariants } from "./button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouter } from "next/router"

interface HorizontalNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
    icon?: React.ReactNode
  }[]
}

export function HorizontalNavbar({ className, items, ...props }: HorizontalNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <>
      <nav
        className={cn(
          "relative hidden space-x-2 lg:flex lg:flex-row lg:items-end lg:gap-4 lg:space-x-0 lg:space-y-1 lg:pt-3",
          "lg:border-b lg:pb-0",
          className,
        )}
        {...props}
      >
        {items.map((item) => (
          <div key={item.href} className="flex flex-col gap-2">
            <Link
              href={item.href}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                pathname === item.href ? "font-bold" : "",
                "justify-start hover:bg-muted hover:underline",
              )}
            >
              {item.icon && <div className="mr-2">{item.icon}</div>}
              {item.title}
            </Link>
            <div className={cn("h-[3px] w-full rounded-sm bg-primary", pathname !== item.href && "bg-transparent")} />
          </div>
        ))}
      </nav>
      <Select onValueChange={(value) => router.push(value)} defaultValue={pathname}>
        <SelectTrigger className="lg:hidden">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.href} value={item.href}>
              {item.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  )
}
