import type { IncidentStatus } from "@/features/interface/work-orders/movistar/enums/IncidentStatus.ts"

export interface WorkOrderIncidentResponse {
  id: number
  description: string
  createdAt: string
  resolvedAt: string | null
  status: IncidentStatus
  imageUrls: string[]
}
