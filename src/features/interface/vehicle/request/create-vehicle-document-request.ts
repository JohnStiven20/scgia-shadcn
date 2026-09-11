import type { VehicleDocumentType } from "../enum/vehicle-document-type"

export type CreateVehicleDocumentRequest = {
  vehicleId: number
  documentType: VehicleDocumentType
  title: string
  issueDate?: string | null
  expirationDate?: string | null
  workerId?: number | null
  active?: boolean | null
  notes?: string | null
  files: File[]
}
