import type {
  IdentificationItemStatus,
  IdentificationUniqueCodeType,
} from "@/features/interface/identification/types"

export interface WorkerOption {
  id: number
  name: string
}

export type EvidenceStatus = "LOCAL" | "UPLOADING" | "UPLOADED" | "ERROR"

export interface LocalEvidence {
  localId: string
  file: File
  previewUrl: string
  status: EvidenceStatus
}

export interface AssignmentSpecificProductDraft {
  draftId: string
  kind: "SPECIFIC"
  telecommunicationItemId: number
  modelId: number
  modelName: string
  identifierId: number
  identifierCode: string
  uniqueCode: string
  uniqueCodeType: IdentificationUniqueCodeType
  status: IdentificationItemStatus
  evidence: LocalEvidence[]
}

export interface AssignmentConsumableDraft {
  draftId: string
  kind: "GENERIC"
  telecommunicationGenericItemId: number
  modelId: number
  modelName: string
  identifierId: number
  identifierCode: string
  quantity: number
  evidence: LocalEvidence[]
}

export interface AssignmentDraft {
  worker: WorkerOption | null
  notes: string
  specificProducts: AssignmentSpecificProductDraft[]
  consumables: AssignmentConsumableDraft[]
  generalEvidence: LocalEvidence[]
}
