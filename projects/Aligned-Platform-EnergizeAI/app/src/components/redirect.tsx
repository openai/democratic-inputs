import { useEffect } from "react"

import { useRouter } from "next/router"

type Props = {
  redirectTo: string
}

export const Redirect = ({ redirectTo }: Props) => {
  const router = useRouter()

  useEffect(() => {
    router.push(redirectTo)
  }, [])

  return null
}
