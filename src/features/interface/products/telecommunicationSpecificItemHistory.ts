export interface TelecommunicationSpecificItemHistoryResponse {
  item: TelecommunicationSpecificItemHistoryItem | null
  history: TelecommunicationSpecificItemHistoryEvent[]
}

export interface TelecommunicationSpecificItemHistoryItem {
  unitCode: string
  uniqueCodeType: "MAC" | "SERIAL"
  status: "AVAILABLE" | "ASSIGNED" | "IN_REPAIR" | "RETIRED"
  modelId: number | null
  modelName: string | null
  identifierId: number | null
  identifierCode: string | null
}

export interface TelecommunicationSpecificItemHistoryEvent {
  movementTransactionId: number
  telecommunicationMovementId: number
  movementType:
    "ENTRY" | "EXIT" | "ASSIGNMENT" | "UNASSIGNMENT" | "RETURN" | "TRANSFER"
  movementDate: string
  performedByAccountUsername: string | null
  fromAccountUsername: string | null
  toAccountUsername: string | null
  fromWarehouseName: string | null
  modelName: string | null
  resourceType: "SPECIFIC"
  identifierCode: string | null
  identifierCodeType: string | null
  unitCode: string
  quantity: number | null
  stockBeforeMovement: number | null
  stockAfterMovement: number | null
  remarks: string | null
  eventImages: ImageResponse[]
  itemImages: ImageResponse[]
}

export interface ImageResponse {
  id: number
  fileName: string
  fileUrl: string
  contentType: string | null
  uploadedAt: string
}
