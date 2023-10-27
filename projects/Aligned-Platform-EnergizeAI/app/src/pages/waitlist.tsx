import { ArrowLeft, CheckIcon, SmileIcon } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SmallSpinner } from "@/components/ui/small-spinner"
import { Textarea } from "@/components/ui/textarea"
import { WaitlistForm } from "@/components/waitlist/waitlist-form"
import { energizeEngine } from "@/lib/energize-engine"
import { DEFAULT_SPACE_ID } from "@/lib/spaces"
import { cn } from "@/lib/utils"
import { waitlistFormSchema } from "@/types/waitlist-types"
import { useAuth, useUser } from "@clerk/clerk-react"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/router"

export default function WaitlistPage() {
  return <WaitlistForm spaceId={DEFAULT_SPACE_ID} />
}
