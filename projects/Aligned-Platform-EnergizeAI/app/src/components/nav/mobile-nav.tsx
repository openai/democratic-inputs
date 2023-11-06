import { ListIcon, LogInIcon, ScaleIcon, UserIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "../ui/button"
import { NavLink } from "./main-nav"
import { SignInButton, SignUpButton, useAuth } from "@clerk/clerk-react"
import { Dialog } from "@headlessui/react"
import { XMarkIcon } from "@heroicons/react/24/outline"
import Link from "next/link"

type Props = {
  protectedLinks: NavLink[]
  setMobileMenuOpen: (open: boolean) => void
  mobileMenuOpen: boolean
}

export const MobileNav = ({ protectedLinks, setMobileMenuOpen, mobileMenuOpen }: Props) => {
  const { userId } = useAuth()

  return (
    <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
      <div className="fixed inset-0 z-50" />
      <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-slate-100/10">
        <div className="flex items-center justify-between">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Aligned</span>
            <img src="/logo.png" alt="Logo" className="h-8 text-primary-foreground" />
          </Link>
          <button type="button" className="-m-2.5 rounded-md p-2.5" onClick={() => setMobileMenuOpen(false)}>
            <span className="sr-only">Close menu</span>
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-6 flow-root">
          <div className="-my-6 divide-y divide-slate-500/10">
            <div className="flex flex-col gap-3 py-6">
              {!userId ? (
                <>
                  <Link href={"/waitlist"} className="block w-full">
                    <Button variant="ghost" className="flex w-full items-center justify-between">
                      Join Waitlist
                      <ListIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <SignInButton mode="redirect">
                    <Button variant="ghost" id="login-button" className="flex items-center justify-between">
                      Log in
                      <LogInIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </SignInButton>
                </>
              ) : (
                <>
                  {protectedLinks.map(({ href, title, icon }) => (
                    <Link key={href} href={href} className="w-full" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="flex w-full items-center justify-between">
                        {title}
                        {icon}
                      </Button>
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </Dialog.Panel>
    </Dialog>
  )
}
