"use client"

import { CheckCircle } from "lucide-react"
import React from "react"

import { buttonVariants } from "./button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouter } from "next/router"

export interface SidebarNavItem {
  href: string
  title: string
  header?: string
  headerIcon?: React.ReactNode
}

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: SidebarNavItem[]
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <>
      <nav className={cn("hidden space-x-2 lg:flex lg:flex-col lg:space-x-0 lg:space-y-1", className)} {...props}>
        {items.map((item) => (
          <React.Fragment key={item.href}>
            {item.header && (
              <p className="flex items-center gap-2 py-4 pl-4 text-sm font-light uppercase text-muted-foreground">
                {item.headerIcon && <span>{item.headerIcon}</span>}
                {item.header}
              </p>
            )}
            <Link
              href={item.href}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                pathname === item.href ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
                "justify-start",
              )}
            >
              {item.title}
            </Link>
          </React.Fragment>
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
