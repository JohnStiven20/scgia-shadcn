import type {
  IdentificationItemStatus,
  IdentificationUniqueCodeType,
} from "@/features/interface/identification/types"

export interface ExitSpecificDraftItem {
  draftId: string
  kind: "SPECIFIC"
  providerId: number
  provider: string
  telecommunicationsItemId: number
  modelId: number
  modelName: string
  identifierId: number
  identifierCode: string
  uniqueCode: string
  uniqueCodeType: IdentificationUniqueCodeType
  status: IdentificationItemStatus
  reason: string
}

export interface ExitConsumableDraftItem {
  draftId: string
  kind: "CONSUMABLE"
  providerId: number
  provider: string
  telecommunicationGenericId: number
  modelId: number
  modelName: string
  identifierId: number
  identifierCode: string
  identifierType: string
  availableQuantity: number | null
  quantity: number
  reason: string
}

export type ExitDraftItem = ExitSpecificDraftItem | ExitConsumableDraftItem
