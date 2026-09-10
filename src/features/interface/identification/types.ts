export type IdentificationOperationType =
  | "ENTRY"
  | "ASSIGNMENT"
  | "RETURN"
  | "EXIT"

export type IdentificationProductType = "SPECIFIC" | "GENERIC"

export type IdentificationUniqueCodeType = "MAC" | "SERIAL"

export type IdentificationItemStatus =
  | "AVAILABLE"
  | "ASSIGNED"
  | "IN_REPAIR"
  | "RETIRED"

export interface IdentificationRequest {
  operationType: IdentificationOperationType
  providerId: number
  rawCode: string
}

export interface IdentificationModelReference {
  id: number
  name: string
}

export interface IdentificationIdentifierReference {
  id: number
  code: string
}

export interface IdentificationResponse {
  productType: IdentificationProductType
  model: IdentificationModelReference
  identifier: IdentificationIdentifierReference
  uniqueCode: string | null
  uniqueCodeType: IdentificationUniqueCodeType | null
  quantity: number | null
  telecommunicationItemId: number | null
  telecommunicationGenericItemId: number | null
  status: IdentificationItemStatus | null
}
