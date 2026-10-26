import type {
  LegacyWorkOrderStatus,
  WorkOrderIncidentState,
  WorkOrderStatus,
} from "@/features/interface/work-orders/types"

const CLOSED_INCIDENT_STATUSES = new Set(["RESOLVED", "FINISHED"])

export const workOrderStatusLabels: Record<WorkOrderStatus, string> = {
  PROGRESSING: "En progreso",
  BLOCKED: "Bloqueado",
  FINISHED: "Finalizado",
}

export function normalizeWorkOrderStatus(
  status: LegacyWorkOrderStatus
): WorkOrderStatus {
  return status === "PENDING" ? "BLOCKED" : status
}

export function isWorkOrderIncidentOpen(
  incident: WorkOrderIncidentState
): boolean {
  if (incident.resolvedAt || incident.finishedAt) return false
  if (!incident.status) return true

  return !CLOSED_INCIDENT_STATUSES.has(incident.status)
}

export function hasOpenWorkOrderIncidents(
  incidents: WorkOrderIncidentState[]
): boolean {
  return incidents.some(isWorkOrderIncidentOpen)
}

export function resolveWorkOrderStatus({
  currentStatus,
  incidents,
  finished = false,
}: {
  currentStatus?: LegacyWorkOrderStatus | null
  incidents: WorkOrderIncidentState[]
  finished?: boolean
}): WorkOrderStatus {
  const normalizedStatus = currentStatus
    ? normalizeWorkOrderStatus(currentStatus)
    : "PROGRESSING"

  if (finished || normalizedStatus === "FINISHED") return "FINISHED"
  if (hasOpenWorkOrderIncidents(incidents)) return "BLOCKED"

  return "PROGRESSING"
}

export function resolveWorkOrderStatusAfterIncidentChange({
  currentStatus,
  incidents,
  finished = false,
}: {
  currentStatus?: LegacyWorkOrderStatus | null
  incidents: WorkOrderIncidentState[]
  finished?: boolean
}): WorkOrderStatus {
  return resolveWorkOrderStatus({
    currentStatus,
    incidents,
    finished,
  })
}
