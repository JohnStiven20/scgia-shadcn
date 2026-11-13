import type { WorkOrderStatus } from "@/features/interface/work-orders/types"

export interface MovistarWorkOrderSummaryResponse {
  id: number
  externalOrderNumber: string
  taskTypeId: number
  taskType: string
  fixedPhoneNumber: string | null
  address: string | null
  status: WorkOrderStatus
  createdAt: string
  finishedAt: string | null
  workerId: number
  workerName: string
  surname: string
  notes:string
}