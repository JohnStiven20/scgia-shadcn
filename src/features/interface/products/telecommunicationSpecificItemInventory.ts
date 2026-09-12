export type TelecommunicationItemStatus =
  "AVAILABLE" | "ASSIGNED" | "IN_REPAIR" | "RETIRED"

export interface TelecommunicationSpecificItemInventoryResponse {
  id: number
  uniqueCode: string
  uniqueCodeType: "MAC" | "SERIAL"
  identifierId: number | null
  identifierCode: string | null
  status: TelecommunicationItemStatus
  workerId: number | null
  workerName: string | null
  createdAt: string
}
