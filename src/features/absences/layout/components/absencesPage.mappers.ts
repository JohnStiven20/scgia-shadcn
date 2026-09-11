import type { EventInput } from "@fullcalendar/core"

import type { AbsenceRequestResponse } from "@/features/interface/absence-request/response/absence-request-response"

import type { AbsenceDetail, AbsenceEvent } from "./absencesPage.types"
import {
  addOneDay,
  getInclusiveDays,
  normalizeAbsenceStatus,
} from "./absencesPage.utils"

export function mapAbsenceResponseToEvent(
  request: AbsenceRequestResponse
): AbsenceEvent | null {
  if (!request.startDate || !request.endDate) {
    return null
  }

  return {
    id: String(request.id),
    requestId: request.id,
    employee: request.name?.trim() || "Sin nombre",
    type: request.absenceTypeName?.trim() || "Permiso",
    start: request.startDate,
    end: request.endDate,
    status: normalizeAbsenceStatus(request.status),
    days: getInclusiveDays(request.startDate, request.endDate),
    note: request.observation?.trim() || undefined,
  }
}

export function mapAbsenceEventToCalendarEvent(
  event: AbsenceEvent
): EventInput {
  return {
    id: event.id,
    title: `${event.employee} - ${event.type} (${event.days} ${
      event.days > 1 ? "dias" : "dia"
    })`,
    start: event.start,
    end: addOneDay(event.end),
    allDay: true,
    extendedProps: event,
  }
}

export function mapAbsenceResponseToDetailModel(
  absence: AbsenceRequestResponse
): AbsenceDetail | null {
  if (!absence.startDate || !absence.endDate) {
    return null
  }

  return {
    id: absence.id,
    employee: absence.name?.trim() || "Sin nombre",
    type: absence.absenceTypeName?.trim() || "Permiso",
    description: absence.description?.trim() || undefined,
    status: normalizeAbsenceStatus(absence.status),
    startDate: absence.startDate,
    endDate: absence.endDate,
    days: getInclusiveDays(absence.startDate, absence.endDate),
    observation: absence.observation?.trim() || undefined,
    requestedAt: absence.requestedAt ?? absence.createdAt ?? undefined,
    documents:
      absence.attachments?.map((attachment) => ({
        id: attachment.id,
        name: attachment.fileName,
        mimeType: attachment.contentType || "application/octet-stream",
        url: attachment.fileUrl,
      })) ?? [],
    reviewedBy: absence.reviewedByWorkerName ?? undefined,
    reviewedAt: absence.reviewedAt ?? undefined,
    reviewComment: absence.reviewComment ?? undefined,
    cancelledBy: absence.cancelledByWorkerName ?? undefined,
    cancelledAt: absence.cancelledAt ?? undefined,
    cancellationReason: absence.cancellationReason ?? undefined,
  }
}
