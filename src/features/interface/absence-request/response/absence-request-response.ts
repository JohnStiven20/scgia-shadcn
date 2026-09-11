export type AbsenceAttachmentResponse = {
  id: number
  absenceRequestId: number
  fileName: string
  fileUrl: string
  cloudinaryPublicId: string
  contentType: string
  uploadedAt: string
}

export type AbsenceRequestResponse = {
  id: number
  workerId?: number | null
  absenceTypeId?: number | null
  absenceTypeName?: string | null
  name?: string | null
  description?: string | null
  startDate?: string | null
  endDate?: string | null
  status?: string | null
  observation?: string | null
  reviewedByWorkerId?: number | null
  reviewedByWorkerName?: string | null
  reviewedByWorkerRole?: string | null
  reviewedAt?: string | null
  reviewComment?: string | null
  cancelledByWorkerId?: number | null
  cancelledByWorkerName?: string | null
  cancelledByWorkerRole?: string | null
  cancelledAt?: string | null
  cancellationReason?: string | null
  attachments?: AbsenceAttachmentResponse[] | null
  requestedAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  active?: boolean
  requiresApproval?: boolean
  calendarColor?: string | null
}

export type AbsenceRequestsPageResponse = {
  content: AbsenceRequestResponse[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
