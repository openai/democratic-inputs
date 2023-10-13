import { useEffect, useState } from "react"

export default function useDebounce<T>(value: T, milliSeconds: number) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, milliSeconds)

    return () => {
      clearTimeout(handler)
    }
  }, [value, milliSeconds])

  return debouncedValue
}
