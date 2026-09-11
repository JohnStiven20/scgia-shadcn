import type { IdentificationItemStatus } from "@/features/interface/identification/types"

export interface AssignmentSummaryResponse {
  id: number
  dateAssigned: string
  notes: string | null
  specificItemCount: number | null
  genericQuantity: number | null
}

export interface AssignmentSpecificItemResponse {
  assignmentTelecommunicationItemId: number
  telecommunicationItemId: number
  identifierId: number | null
  identifierCode: string | null
  uniqueCode: string | null
  uniqueCodeType: string | null
  status: IdentificationItemStatus | null
}

export interface AssignmentSpecificModelResponse {
  modelId: number
  modelName: string
  quantity: number
  items: AssignmentSpecificItemResponse[]
}

export interface AssignmentGenericItemResponse {
  assignmentTelecommunicationGenericItemId: number
  telecommunicationGenericItemId: number
  identifierId: number | null
  identifierCode: string | null
  quantity: number | null
}

export interface AssignmentGenericModelResponse {
  modelId: number
  modelName: string
  quantity: number
  items: AssignmentGenericItemResponse[]
}

export interface AssignmentDetailResponse {
  id: number
  accountId: number
  dateAssigned: string
  notes: string | null
  specificModels: AssignmentSpecificModelResponse[]
  genericModels: AssignmentGenericModelResponse[]
}
