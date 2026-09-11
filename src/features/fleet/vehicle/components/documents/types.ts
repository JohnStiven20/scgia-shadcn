import type { VehicleDocumentType } from "@/features/interface/vehicle/enum/vehicle-document-type"
import type { StoredFileResponse } from "@/features/interface/vehicle/response/stored-file-response"

export type VehicleDocumentStatus =
  "VALID" | "EXPIRING_SOON" | "EXPIRED" | "NO_EXPIRATION"

export type VehicleDocumentQuickFilter = "ALL" | VehicleDocumentStatus

export type VehicleDocumentFilters = {
  documentType: VehicleDocumentType | "ALL"
  status: VehicleDocumentQuickFilter
  title: string
}

export type VehicleDocumentListItemView = {
  id: number
  vehicleId: number
  title: string
  documentType: VehicleDocumentType
  documentTypeLabel: string
  categoryLabel: string
  issueDate: string | null
  expirationDate: string | null
  status: VehicleDocumentStatus
  statusLabel: string
  daysUntilExpiration: number | null
  responsible: {
    id: number | null
    name: string
  } | null
  notes: string | null
  active: boolean
  storedFiles: StoredFileResponse[]
  primaryFile: StoredFileResponse | null
  createdAt: string | null
  updatedAt: string | null
}

export type VehicleDocumentGroupView = {
  key: VehicleDocumentType
  label: string
  iconColor: string
  iconBackground: string
  items: VehicleDocumentListItemView[]
}
