import type { WorkerTrainingDocument } from "@/features/interface/worker-document/type/worker-document.interface"
import { API_BASE_URL } from "@/api/apiConfig"

export type WorkerDocumentStatus =
  "Vigente" | "Por caducar" | "Caducado" | "Sin vencimiento"

export type WorkerDocumentSectionKey =
  "ALL" | "FORMACION" | "SEGURIDAD" | "OPERACION" | "UNASSIGNED"

export const documentSectionOptions: Array<{
  key: WorkerDocumentSectionKey
  value: string | null
  label: string
}> = [
  { key: "ALL", value: null, label: "Todos" },
  { key: "FORMACION", value: "FORMACION", label: "Formación" },
  { key: "SEGURIDAD", value: "SEGURIDAD", label: "Seguridad" },
  { key: "OPERACION", value: "OPERACION", label: "Operación" },
  { key: "UNASSIGNED", value: "UNASSIGNED", label: "Sin sección" },
]

export function normalizeDocumentSection(
  value?: string | null
): WorkerDocumentSectionKey {
  const normalized = value?.toUpperCase()

  if (normalized === "FORMACION" || normalized === "FORMATION") {
    return "FORMACION"
  }

  if (normalized === "SEGURIDAD" || normalized === "SECURITY") {
    return "SEGURIDAD"
  }

  if (normalized === "OPERACION" || normalized === "OPERATION") {
    return "OPERACION"
  }

  return "UNASSIGNED"
}

export function getDocumentSectionLabel(value?: string | null) {
  const key = normalizeDocumentSection(value)

  return (
    documentSectionOptions.find((option) => option.key === key)?.label ??
    "Sin sección"
  )
}

export function getWorkerDocumentStatus(
  document: WorkerTrainingDocument
): WorkerDocumentStatus {
  if (!document.expirationDate) {
    return "Sin vencimiento"
  }

  const expirationDate = new Date(document.expirationDate)

  if (Number.isNaN(expirationDate.getTime())) {
    return "Sin vencimiento"
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  expirationDate.setHours(0, 0, 0, 0)

  const daysToExpire = Math.ceil(
    (expirationDate.getTime() - today.getTime()) / 86_400_000
  )

  if (daysToExpire < 0) {
    return "Caducado"
  }

  if (daysToExpire <= 30) {
    return "Por caducar"
  }

  return "Vigente"
}

export function getDaysToExpire(expirationDate?: string | null) {
  if (!expirationDate) {
    return null
  }

  const date = new Date(expirationDate)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)

  return Math.ceil((date.getTime() - today.getTime()) / 86_400_000)
}

export function sortWorkerDocuments(documents: WorkerTrainingDocument[]) {
  return [...documents].sort((first, second) => {
    const firstTime = first.expirationDate
      ? new Date(first.expirationDate).getTime()
      : Number.MAX_SAFE_INTEGER
    const secondTime = second.expirationDate
      ? new Date(second.expirationDate).getTime()
      : Number.MAX_SAFE_INTEGER

    return firstTime - secondTime
  })
}

export function formatFileSize(value?: number | null) {
  if (!value) {
    return "Sin tamaño"
  }

  if (value < 1024 * 1024) {
    return `${Math.round(value / 1024)} KB`
  }

  return `${(value / 1024 / 1024).toFixed(1)} MB`
}

export function buildDocumentUrl(path?: string | null) {
  if (!path) {
    return ""
  }

  if (/^https?:\/\//i.test(path)) {
    return path
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const apiOrigin = API_BASE_URL.replace(/\/api\/?$/, "")

  return `${apiOrigin}${normalizedPath}`
}

export function canPreviewDocument(mimeType?: string | null, path?: string) {
  const normalizedMimeType = mimeType?.toLowerCase() ?? ""
  const normalizedPath = path?.toLowerCase() ?? ""

  return (
    normalizedMimeType.includes("pdf") ||
    normalizedMimeType.startsWith("image/") ||
    normalizedPath.endsWith(".pdf") ||
    normalizedPath.endsWith(".png") ||
    normalizedPath.endsWith(".jpg") ||
    normalizedPath.endsWith(".jpeg") ||
    normalizedPath.endsWith(".webp")
  )
}

export function isImageDocument(mimeType?: string | null, path?: string) {
  const normalizedMimeType = mimeType?.toLowerCase() ?? ""
  const normalizedPath = path?.toLowerCase() ?? ""

  return (
    normalizedMimeType.startsWith("image/") ||
    normalizedPath.endsWith(".png") ||
    normalizedPath.endsWith(".jpg") ||
    normalizedPath.endsWith(".jpeg") ||
    normalizedPath.endsWith(".webp")
  )
}
