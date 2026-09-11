import type { AbsenceRequestResponse } from "@/features/interface/absence-request/response/absence-request-response"

export type AbsenceStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"

export type CalendarViewMode = "month" | "week" | "list"

export type VisibleRange = {
  from: string
  to: string
}

export type AbsenceEvent = {
  id: string
  requestId: number
  employee: string
  type: string
  start: string
  end: string
  status: AbsenceStatus
  days: number
  note?: string
}

export type AbsenceDetailDocument = {
  id: number
  name: string
  mimeType: string
  url: string
}

export type AbsenceDetail = {
  id: number
  employee: string
  type: string
  description?: string
  status: AbsenceStatus
  startDate: string
  endDate: string
  days: number
  observation?: string
  requestedAt?: string
  documents: AbsenceDetailDocument[]
  reviewedBy?: string
  reviewedAt?: string
  reviewComment?: string
  cancelledBy?: string
  cancelledAt?: string
  cancellationReason?: string
}

export type AbsenceDetailDialogProps = {
  canApprove: boolean
  canReject: boolean
  isResolutionLoading: boolean
  onApprove: () => void
  onClose: () => void
  onReject: () => void
  onResolutionCommentChange: (value: string) => void
  open: boolean
  resolutionComment: string
  selectedAbsence: AbsenceDetail | null
  selectedRequest: AbsenceRequestResponse | null
}
