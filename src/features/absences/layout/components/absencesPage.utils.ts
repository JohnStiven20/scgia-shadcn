import type { AbsenceStatus } from "./absencesPage.types"
export function addOneDay(dateString: string) {
  const nextDate = new Date(`${dateString}T00:00:00`)
  nextDate.setDate(nextDate.getDate() + 1)
  return nextDate.toISOString().slice(0, 10)
}

export function subtractOneDay(dateString: string) {
  const previousDate = new Date(`${dateString}T00:00:00`)
  previousDate.setDate(previousDate.getDate() - 1)
  return previousDate.toISOString().slice(0, 10)
}

export function getInclusiveDays(start: string, end: string) {
  const startDate = new Date(`${start}T00:00:00`)
  const endDate = new Date(`${end}T00:00:00`)
  const diffInMs = endDate.getTime() - startDate.getTime()
  return Math.floor(diffInMs / 86_400_000) + 1
}

export function normalizeAbsenceStatus(status?: string | null): AbsenceStatus {
  const normalized = status?.toUpperCase()

  if (
    normalized === "PENDING" ||
    normalized === "APPROVED" ||
    normalized === "REJECTED" ||
    normalized === "CANCELLED"
  ) {
    return normalized
  }

  return "PENDING"
}

export function formatDate(value?: string | null) {
  if (!value) {
    return "-"
  }

  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

export function formatEventDateRange(start: string, end: string) {
  const formatter = new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
  })
  const startDate = new Date(`${start}T00:00:00`)
  const endDate = new Date(`${end}T00:00:00`)

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return "-"
  }

  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`
}

export function formatDateTime(value?: string | null) {
  if (!value) {
    return "-"
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function toInputDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function getDateFromInput(value: string) {
  return new Date(`${value}T12:00:00`)
}
