import type { VehicleDocumentResponse } from "@/features/interface/vehicle/response/vehicle-document-response"

import {
  EXPIRING_SOON_DAYS,
  VEHICLE_DOCUMENT_STATUS_META,
  VEHICLE_DOCUMENT_TYPE_META,
} from "./constants"
import type {
  VehicleDocumentGroupView,
  VehicleDocumentListItemView,
  VehicleDocumentStatus,
} from "./types"
import { getDaysUntil } from "./utils"

export function getDocumentStatus(
  expirationDate?: string | null
): VehicleDocumentStatus {
  const daysUntilExpiration = getDaysUntil(expirationDate)

  if (daysUntilExpiration === null) return "NO_EXPIRATION"
  if (daysUntilExpiration < 0) return "EXPIRED"
  if (daysUntilExpiration <= EXPIRING_SOON_DAYS) return "EXPIRING_SOON"
  return "VALID"
}

export function mapVehicleDocument(
  dto: VehicleDocumentResponse
): VehicleDocumentListItemView {
  const typeMeta = VEHICLE_DOCUMENT_TYPE_META[dto.documentType]
  const status = getDocumentStatus(dto.expirationDate)
  const workerName = [dto.workerName, dto.workerSurname]
    .filter(Boolean)
    .join(" ")

  return {
    id: dto.id,
    vehicleId: dto.vehicleId,
    title: dto.title,
    documentType: dto.documentType,
    documentTypeLabel: typeMeta.label,
    categoryLabel: typeMeta.categoryLabel,
    issueDate: dto.issueDate ?? null,
    expirationDate: dto.expirationDate ?? null,
    status,
    statusLabel: VEHICLE_DOCUMENT_STATUS_META[status].label,
    daysUntilExpiration: getDaysUntil(dto.expirationDate),
    responsible: dto.workerId
      ? {
          id: dto.workerId,
          name: workerName || `Trabajador #${dto.workerId}`,
        }
      : null,
    notes: dto.notes ?? null,
    active: dto.active ?? true,
    storedFiles: dto.storedFiles ?? [],
    primaryFile: dto.storedFiles?.[0] ?? null,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  }
}

export function groupVehicleDocuments(
  documents: VehicleDocumentListItemView[]
): VehicleDocumentGroupView[] {
  const grouped = documents.reduce<
    Record<string, VehicleDocumentListItemView[]>
  >((acc, document) => {
    acc[document.documentType] = acc[document.documentType] ?? []
    acc[document.documentType].push(document)
    return acc
  }, {})

  return Object.entries(grouped).map(([key, items]) => {
    const documentType = items[0].documentType
    const meta = VEHICLE_DOCUMENT_TYPE_META[documentType]

    return {
      key: documentType,
      label: meta.label,
      iconColor: meta.iconColor,
      iconBackground: meta.iconBackground,
      items: items.sort((a, b) => a.title.localeCompare(b.title)),
    }
  })
}
