type Props = {
  date: Date | null
}

export const DataTableDateCell = ({ date }: Props) => {
  if (!date) return null
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return <span className="whitespace-nowrap">{formattedDate}</span>
}
