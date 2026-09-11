import type { VehicleDocumentType } from "../enum/vehicle-document-type"
import type { StoredFileResponse } from "./stored-file-response"

export type VehicleDocumentResponse = {
  id: number
  vehicleId: number
  documentType: VehicleDocumentType
  title: string
  issueDate?: string | null
  expirationDate?: string | null
  workerId?: number | null
  workerName?: string | null
  workerSurname?: string | null
  active?: boolean | null
  notes?: string | null
  storedFiles: StoredFileResponse[]
  createdAt?: string | null
  updatedAt?: string | null
}
