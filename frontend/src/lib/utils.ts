import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
}

export function isTodayReset(date: Date): boolean {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

export function getTodayDate(): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export function parseApiError(err: any, fallback: string = "An error occurred"): string {
  const detail = err.response?.data?.detail;
  if (typeof detail === "string") {
    return detail;
  } else if (Array.isArray(detail) && detail.length > 0) {
    return detail.map((e: any) => e.msg).join(", ");
  } else if (err.message) {
    return err.message;
  }
  return fallback;
}
