import { InfoIcon } from "lucide-react"

type Props = {
  message?: string
}

export const NoDataWarning = ({ message = "No data to display." }: Props) => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-10 py-20">
      <InfoIcon />
      <p>{message}</p>
    </div>
  )
}

export default NoDataWarning
