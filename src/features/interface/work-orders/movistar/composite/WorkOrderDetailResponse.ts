import type { WorkOrderSpecificItemLineResponse } from "@/features/interface/work-orders/types.ts"
import type {
  WorkOrderIncidentResponse
} from "@/features/interface/work-orders/movistar/indicents/WorkOrderIncidentResponse.ts"

export interface WorkOrderDetailResponse {
  specificItems: WorkOrderSpecificItemLineResponse[]
  incidents: WorkOrderIncidentResponse[]
}
