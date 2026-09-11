import { differenceInCalendarDays, format, isValid, parseISO } from "date-fns"
import { es } from "date-fns/locale"

export function formatDate(value?: string | null) {
  if (!value) return "-"

  const date = parseISO(value)
  return isValid(date) ? format(date, "dd/MM/yyyy", { locale: es }) : "-"
}

export function formatDateTime(value?: string | null) {
  if (!value) return "-"

  const date = parseISO(value)
  return isValid(date) ? format(date, "dd/MM/yyyy HH:mm", { locale: es }) : "-"
}

export function toDateInputValue(value?: Date | string | null) {
  if (!value) return null

  const date = value instanceof Date ? value : parseISO(value)
  return isValid(date) ? format(date, "yyyy-MM-dd") : null
}

export function toDate(value?: string | null) {
  if (!value) return undefined

  const date = parseISO(value)
  return isValid(date) ? date : undefined
}

export function getDaysUntil(value?: string | null) {
  if (!value) return null

  const date = parseISO(value)
  return isValid(date) ? differenceInCalendarDays(date, new Date()) : null
}

export function formatBytes(value?: number | null) {
  if (!value || value <= 0) return "-"
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

export function getFileKind(contentType?: string | null) {
  if (!contentType) return "Archivo"
  if (contentType.includes("pdf")) return "PDF"
  if (contentType.startsWith("image/")) return "Imagen"
  return contentType
}

export function downloadFile(url: string, fileName: string) {
  const link = document.createElement("a")
  link.href = url
  link.target = "_blank"
  link.rel = "noopener noreferrer"
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
