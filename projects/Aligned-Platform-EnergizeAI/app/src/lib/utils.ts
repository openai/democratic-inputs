import { ClassValue, clsx } from "clsx"
import { createHash } from "crypto"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const generateID = () => {
  return Math.random().toString(36).substring(7)
}

export const toTitleCase = (str: string) => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

export const truncate = (str: string, n: number) => {
  return str.length > n ? str.substr(0, n - 1) + "..." : str
}

export const isNullish = (value: any) => {
  return value === null || value === undefined
}

export const createShaHash = (str: string) => {
  return createHash("sha256").update(str).digest("hex")
}

export const trimParagraph = (paragraph: string) => {
  return paragraph
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
}

export function throttle<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let inThrottle: boolean
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), delay)
    }
  } as T
}

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function arrayToCSV(arr: Array<any>): string {
  // Get the keys for object to be used as headers
  const headers = Object.keys(arr[0]).join(",")

  // Map the array of objects to an array of CSV strings
  const rows = arr.map((obj) =>
    Object.values(obj)
      .map((value) => `"${String(value).replace(/"/g, '""')}"`) // Escape double quotes and encapsulate value in double quotes
      .join(","),
  )

  // Combine the headers and rows
  return `${headers}\n${rows.join("\n")}`
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()

  window.URL.revokeObjectURL(url)
}

export function removeSearchParam(param: string) {
  const url = new URL(window.location.href)
  url.searchParams.delete(param)
  window.history.replaceState({}, "", url.toString())
}
