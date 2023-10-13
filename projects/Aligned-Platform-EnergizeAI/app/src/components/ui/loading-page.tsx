import { Spinner } from "@/components/ui/spinner"

export const LoadingPage = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Spinner />
    </div>
  )
}
