import type { IdentificationUniqueCodeType } from "@/features/interface/identification/types"

export interface SpecificEntryDraftItem {
  id: string
  providerId: number
  modelId: number
  identifierId: number
  telecommunicationItemId: number | null
  model: string
  modelIdentifier: string
  provider: string
  uniqueCode: string
  uniqueCodeType: IdentificationUniqueCodeType
}

export interface GenericEntryDraftItem {
  id: string
  providerId: number
  modelId: number
  identifierId: number
  telecommunicationGenericItemId: number | null
  model: string
  provider: string
  identifier: string
  identifierType: string
  quantity: number
}
