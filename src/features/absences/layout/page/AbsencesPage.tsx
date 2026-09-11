import { useMemo, useRef, useState } from "react"
import FullCalendar from "@fullcalendar/react"
import type { DatesSetArg, EventClickArg, EventInput } from "@fullcalendar/core"

import { useNotifications } from "@/components/notifications/NotificationsProvider"
import {
  useApproveAbsenceRequestMutation,
  useGetCalendarVisibleAbsenceRequestsByRangeQuery,
  useRejectAbsenceRequestMutation,
} from "@/features/absences/api/absenceRequestApi"
import type { AbsenceRequestResponse } from "@/features/interface/absence-request/response/absence-request-response"
import { useGlobalError } from "@/hooks"

import { AbsenceDetailDialog } from "../components/AbsenceDetailDialog"
import { AbsencesCalendarPanel } from "../components/AbsencesCalendarPanel"
import { AbsencesPageHeader } from "../components/AbsencesPageHeader"
import { AbsencesSidebar } from "../components/AbsencesSidebar"
import { emptyCalendarRequests } from "../components/absencesPage.constants"
import {
  mapAbsenceEventToCalendarEvent,
  mapAbsenceResponseToDetailModel,
  mapAbsenceResponseToEvent,
} from "../components/absencesPage.mappers"
import type {
  AbsenceEvent,
  CalendarViewMode,
  VisibleRange,
} from "../components/absencesPage.types"
import {
  hasPermission,
  subtractOneDay,
} from "../components/absencesPage.utils"

export function AbsencesPage() {
  const calendarRef = useRef<FullCalendar | null>(null)
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [currentTitle, setCurrentTitle] = useState("")
  const [visibleRange, setVisibleRange] = useState<VisibleRange | null>(null)
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month")
  const [excludedEmployees, setExcludedEmployees] = useState<string[]>([])
  const [selectedAbsenceId, setSelectedAbsenceId] = useState<number | null>(
    null
  )
  const [resolutionComment, setResolutionComment] = useState("")
  const { handleError } = useGlobalError()
  const notifications = useNotifications()
  const { data: calendarRequests = emptyCalendarRequests } =
    useGetCalendarVisibleAbsenceRequestsByRangeQuery(visibleRange!, {
      skip: visibleRange === null,
    })
  const [approveAbsenceRequest, { isLoading: isApproving }] =
    useApproveAbsenceRequestMutation()
  const [rejectAbsenceRequest, { isLoading: isRejecting }] =
    useRejectAbsenceRequestMutation()
  const canApproveAbsence = hasPermission("absence.management.approve")
  const canRejectAbsence = hasPermission("absence.management.reject")
  const isResolutionLoading = isApproving || isRejecting

  const absenceEvents = useMemo<AbsenceEvent[]>(
    () =>
      (calendarRequests as AbsenceRequestResponse[])
        .map(mapAbsenceResponseToEvent)
        .filter((event): event is AbsenceEvent => event !== null),
    [calendarRequests]
  )
  const employees = useMemo(
    () => Array.from(new Set(absenceEvents.map((event) => event.employee))),
    [absenceEvents]
  )
  const selectedEmployees = useMemo(
    () => employees.filter((employee) => !excludedEmployees.includes(employee)),
    [employees, excludedEmployees]
  )
  const filteredAbsences = useMemo(
    () =>
      absenceEvents.filter((event) => selectedEmployees.includes(event.employee)),
    [absenceEvents, selectedEmployees]
  )
  const calendarEvents = useMemo<EventInput[]>(
    () => filteredAbsences.map(mapAbsenceEventToCalendarEvent),
    [filteredAbsences]
  )
  const highlightedDays = useMemo(
    () =>
      [...filteredAbsences]
        .sort((left, right) => left.start.localeCompare(right.start))
        .slice(0, 4),
    [filteredAbsences]
  )
  const stats = useMemo(
    () => ({
      totalRequests: filteredAbsences.length,
      pendingRequests: filteredAbsences.filter(
        (event) => event.status === "PENDING"
      ).length,
      approvedRequests: filteredAbsences.filter(
        (event) => event.status === "APPROVED"
      ).length,
    }),
    [filteredAbsences]
  )
  const selectedRequest = useMemo<AbsenceRequestResponse | null>(
    () =>
      (calendarRequests as AbsenceRequestResponse[]).find(
        (request) => request.id === selectedAbsenceId
      ) ?? null,
    [calendarRequests, selectedAbsenceId]
  )
  const selectedAbsence = useMemo(
    () =>
      selectedRequest ? mapAbsenceResponseToDetailModel(selectedRequest) : null,
    [selectedRequest]
  )

  function handleDatesSet(arg: DatesSetArg) {
    const nextTitle = arg.view.title
    const nextRange = {
      from: arg.startStr.slice(0, 10),
      to: subtractOneDay(arg.endStr.slice(0, 10)),
    }

    setCurrentTitle((current) => (current === nextTitle ? current : nextTitle))
    setVisibleRange((current) => {
      if (current?.from === nextRange.from && current?.to === nextRange.to) {
        return current
      }

      return nextRange
    })
  }

  function handleCalendarEventClick(arg: EventClickArg) {
    const requestId = Number(arg.event.id)

    if (!Number.isNaN(requestId)) {
      openAbsenceDetail(requestId)
    }
  }

  function handleViewChange(nextView: CalendarViewMode) {
    setViewMode(nextView)

    const calendarApi = calendarRef.current?.getApi()
    if (!calendarApi || nextView === "list") {
      return
    }

    calendarApi.changeView(
      nextView === "month" ? "dayGridMonth" : "dayGridWeek"
    )
  }

  function syncSelectedDate(date: Date) {
    setSelectedDate(date)
    calendarRef.current?.getApi().gotoDate(date)
  }

  function toggleEmployee(employee: string) {
    setExcludedEmployees((current) =>
      current.includes(employee)
        ? current.filter((item) => item !== employee)
        : [...current, employee]
    )
  }

  function selectAllEmployees() {
    setExcludedEmployees([])
  }

  function openAbsenceDetail(absenceId: number) {
    setSelectedAbsenceId(absenceId)
    setResolutionComment("")
  }

  function closeAbsenceDetail() {
    if (isResolutionLoading) {
      return
    }

    setSelectedAbsenceId(null)
    setResolutionComment("")
  }

  function handlePrevious() {
    calendarRef.current?.getApi().prev()
  }

  function handleNext() {
    calendarRef.current?.getApi().next()
  }

  function handleGoToday() {
    const today = new Date()
    setSelectedDate(today)
    calendarRef.current?.getApi().today()
  }

  async function handleApprove() {
    if (!selectedAbsenceId || !canApproveAbsence) {
      return
    }

    try {
      await approveAbsenceRequest({
        id: selectedAbsenceId,
        reviewComment: resolutionComment,
      }).unwrap()

      notifications.success("Solicitud aprobada correctamente.")
      closeAbsenceDetail()
    } catch (error) {
      handleError(error, "No se pudo aprobar la solicitud de ausencia.")
    }
  }

  async function handleReject() {
    if (!selectedAbsenceId || !canRejectAbsence) {
      return
    }

    try {
      await rejectAbsenceRequest({
        id: selectedAbsenceId,
        reviewComment: resolutionComment,
      }).unwrap()

      notifications.success("Solicitud rechazada correctamente.")
      closeAbsenceDetail()
    } catch (error) {
      handleError(error, "No se pudo rechazar la solicitud de ausencia.")
    }
  }

  return (
    <section className="grid gap-4" aria-label="Gestion de ausencias">
      <AbsencesPageHeader
        totalRequests={stats.totalRequests}
        pendingRequests={stats.pendingRequests}
        approvedRequests={stats.approvedRequests}
      />

      <div className="grid gap-4 xl:grid-cols-[24rem_minmax(0,1fr)]">
        <AbsencesSidebar
          selectedDate={selectedDate}
          employees={employees}
          selectedEmployees={selectedEmployees}
          highlightedDays={highlightedDays}
          viewMode={viewMode}
          onDateChange={syncSelectedDate}
          onToggleEmployee={toggleEmployee}
          onSelectAllEmployees={selectAllEmployees}
          onOpenAbsence={openAbsenceDetail}
          onViewChange={handleViewChange}
        />

        <AbsencesCalendarPanel
          calendarRef={calendarRef}
          calendarEvents={calendarEvents}
          filteredAbsences={filteredAbsences}
          currentTitle={currentTitle}
          viewMode={viewMode}
          onDatesSet={handleDatesSet}
          onEventClick={handleCalendarEventClick}
          onGoToday={handleGoToday}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onViewChange={handleViewChange}
          onOpenAbsence={openAbsenceDetail}
        />
      </div>

      <AbsenceDetailDialog
        open={selectedAbsence !== null}
        selectedAbsence={selectedAbsence}
        selectedRequest={selectedRequest}
        resolutionComment={resolutionComment}
        isResolutionLoading={isResolutionLoading}
        canApprove={canApproveAbsence}
        canReject={canRejectAbsence}
        onApprove={handleApprove}
        onReject={handleReject}
        onClose={closeAbsenceDetail}
        onResolutionCommentChange={setResolutionComment}
      />
    </section>
  )
}
