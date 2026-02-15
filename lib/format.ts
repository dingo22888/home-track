import { format, parseISO } from "date-fns"

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "dd MMM yyyy")
  } catch {
    return dateStr
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "dd MMM yyyy, HH:mm")
  } catch {
    return dateStr
  }
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat("en", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value)
}
