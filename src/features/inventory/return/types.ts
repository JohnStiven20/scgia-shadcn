import type { IdentificationItemStatus } from "@/features/interface/identification/types"

export interface ReturnLocalEvidence {
  localId: string
  file: File
  previewUrl: string
}

export interface ReturnSpecificDraftItem {
  draftId: string
  kind: "SPECIFIC"
  assignmentTelecommunicationItemId: number
  telecommunicationItemId: number
  modelId: number
  modelName: string
  identifierCode: string | null
  uniqueCode: string
  uniqueCodeType: string | null
  status: IdentificationItemStatus | null
  evidence: ReturnLocalEvidence[]
}

export interface ReturnGenericDraftItem {
  draftId: string
  kind: "GENERIC"
  assignmentTelecommunicationGenericItemId: number
  telecommunicationGenericItemId: number
  modelId: number
  modelName: string
  identifierId: number
  identifierCode: string | null
  quantity: number
  assignedQuantity: number
  evidence: ReturnLocalEvidence[]
}

export type ReturnDraftItem = ReturnSpecificDraftItem | ReturnGenericDraftItem

export interface ReturnDraft {
  specificItems: ReturnSpecificDraftItem[]
  genericItems: ReturnGenericDraftItem[]
}
