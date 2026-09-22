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

export interface IdentificationManualRequest {
  operationType: IdentificationOperationType
  providerId: number
  identification: string
  unitCode: string
}

export interface IdentificationModelReference {
  id: number
  name: string
  productType: IdentificationProductType
}

export interface IdentificationIdentifierReference {
  id: number
  code: string
}

export interface IdentificationUnitCodeReference {
  code: string
  productType: IdentificationUniqueCodeType
  status: IdentificationItemStatus
}

export interface IdentificationResponse {
  identifier: IdentificationIdentifierReference
  model: IdentificationModelReference
  unitCode: IdentificationUnitCodeReference
  quantity: number | null
  telecommunicationItemId: number | null
  telecommunicationGenericItemId: number | null
}

