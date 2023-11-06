import { SmallSpinner } from "./small-spinner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

type Props = {
  children?: React.ReactNode
  handleConfirm: () => void
  confirmationMessage: string
  open?: boolean
  setOpen?: (open: boolean) => void
  variant?: "destructive"
  isLoading?: boolean
}

export const AreYouSure = ({
  handleConfirm,
  children,
  confirmationMessage,
  open,
  setOpen,
  variant,
  isLoading,
}: Props) => {
  return (
    <AlertDialog open={open} onOpenChange={setOpen ? (v) => setOpen(v) : undefined}>
      {children && <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>{confirmationMessage}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleConfirm()
            }}
            disabled={isLoading}
            className={cn(
              variant === "destructive" &&
                "bg-destructive text-destructive-foreground hover:bg-destructive hover:text-destructive-foreground hover:opacity-80",
            )}
          >
            Confirm
            {isLoading && <SmallSpinner className="ml-2 text-white" />}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
