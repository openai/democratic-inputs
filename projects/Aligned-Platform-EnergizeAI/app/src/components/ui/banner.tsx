import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import Link from "next/link"

type Props = {
  className?: string
  title: string
  description: string
  onClose?: () => void
  linkText: string
  linkHref: string
}

export const Banner = ({ className, title, description, onClose, linkText, linkHref }: Props) => {
  return (
    <div
      className={cn(
        "from-indigo-200/50 from-10% via-blue-300/50 via-sky-50 via-30% via-50% to-amber-200/50 to-yellow-200/50 to-70% to-90%",
        "dark:from-indigo-900/50 dark:from-10% dark:via-blue-900/50 dark:via-sky-900 dark:via-30% dark:via-50% dark:to-amber-900/50 dark:to-yellow-900/50 dark:to-70%",
        className,
      )}
    >
      <motion.div
        className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 bg-gradient-to-r px-6 py-3 text-center "
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-sm leading-6 text-foreground">
          <strong className="font-semibold">{title}</strong>
          <svg viewBox="0 0 2 2" className="mx-2 inline h-0.5 w-0.5 fill-current" aria-hidden="true">
            <circle cx={1} cy={1} r={1} />
          </svg>
          {description}
        </p>
        <Link
          href={linkHref}
          className="rounded-full bg-foreground px-4 py-1 text-xs font-semibold leading-6 text-background hover:underline"
        >
          {linkText}
          <ArrowRight className="ml-1 inline-block h-4 w-4 text-background" />
        </Link>
      </motion.div>
    </div>
  )
}
