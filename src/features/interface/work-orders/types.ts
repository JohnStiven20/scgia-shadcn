export interface WorkOrderSpecificItemLineResponse {
  workOrderSpecificItemId: number
  telecommunicationItemId: number
  modelName: string
  uniqueCode: string
  identifierCode: string
}

export type WorkOrderStatus = "PROGRESSING" | "BLOCKED" | "FINISHED"

export type LegacyWorkOrderStatus = WorkOrderStatus | "PENDING"

export type WorkOrderIncidentStatus =
  | "OPEN"
  | "PROGRESSING"
  | "BLOCKED"
  | "RESOLVED"
  | "FINISHED"

export interface WorkOrderIncidentState {
  status?: WorkOrderIncidentStatus | null
  resolvedAt?: string | null
  finishedAt?: string | null
}

export interface WorkOrderListResponse {
  id: number
  externalOrderNumber: string
  fixedPhoneNumber: string
  address: string
  workerName: string
  status: WorkOrderStatus
  createdAt: string
  finishedAt: string | null
  productCount: number
  incidentCount: number
}
