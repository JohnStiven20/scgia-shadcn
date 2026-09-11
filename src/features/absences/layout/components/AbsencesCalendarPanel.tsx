import type { RefObject } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import multiMonthPlugin from "@fullcalendar/multimonth"
import interactionPlugin from "@fullcalendar/interaction"
import esLocale from "@fullcalendar/core/locales/es"
import type {
  DatesSetArg,
  EventClickArg,
  EventContentArg,
  EventInput,
} from "@fullcalendar/core"
import { ChevronLeft, ChevronRight, List } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { statusVisuals } from "./absencesPage.constants"
import type { AbsenceEvent, CalendarViewMode } from "./absencesPage.types"
import { formatDate, formatEventDateRange } from "./absencesPage.utils"

type AbsencesCalendarPanelProps = {
  calendarRef: RefObject<FullCalendar | null>
  calendarEvents: EventInput[]
  filteredAbsences: AbsenceEvent[]
  currentTitle: string
  viewMode: CalendarViewMode
  onDatesSet: (arg: DatesSetArg) => void
  onEventClick: (arg: EventClickArg) => void
  onGoToday: () => void
  onNext: () => void
  onPrevious: () => void
  onViewChange: (viewMode: CalendarViewMode) => void
  onOpenAbsence: (requestId: number) => void
}

export function AbsencesCalendarPanel({
  calendarRef,
  calendarEvents,
  filteredAbsences,
  currentTitle,
  viewMode,
  onDatesSet,
  onEventClick,
  onGoToday,
  onNext,
  onPrevious,
  onViewChange,
  onOpenAbsence,
}: AbsencesCalendarPanelProps) {
  return (
    <Card className="border-border/80 py-4 shadow-sm shadow-slate-100/70 [--card-spacing:--spacing(4)]">
      <CardHeader className="gap-3 pb-3 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <CardTitle className="text-3xl font-bold tracking-normal text-slate-950">
            {currentTitle || "Calendario de ausencias"}
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {filteredAbsences.length} solicitudes visibles
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-md border p-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Rango anterior"
              onClick={onPrevious}
            >
              <ChevronLeft />
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onGoToday}>
              Hoy
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Rango siguiente"
              onClick={onNext}
            >
              <ChevronRight />
            </Button>
          </div>
          <div className="flex rounded-md border p-0.5">
            <ViewButton
              active={viewMode === "month"}
              label="Mes"
              onClick={() => onViewChange("month")}
            />
            <ViewButton
              active={viewMode === "week"}
              label="Semana"
              onClick={() => onViewChange("week")}
            />
            <ViewButton
              active={viewMode === "list"}
              label="Lista"
              onClick={() => onViewChange("list")}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === "list" ? (
          <AbsencesListView
            absences={filteredAbsences}
            onOpenAbsence={onOpenAbsence}
          />
        ) : (
          <div className="absence-calendar rounded-lg border bg-card p-2">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, multiMonthPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={false}
              locales={[esLocale]}
              locale="es"
              firstDay={1}
              fixedWeekCount={false}
              height="auto"
              dayMaxEventRows={3}
              dayHeaderFormat={{ weekday: "long" }}
              events={calendarEvents}
              datesSet={onDatesSet}
              eventClick={onEventClick}
              eventContent={renderEventContent}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ViewButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="sm"
      onClick={onClick}
    >
      {label === "Lista" ? <List /> : null}
      {label}
    </Button>
  )
}

function renderEventContent(arg: EventContentArg) {
  const event = arg.event.extendedProps as AbsenceEvent
  const visual = statusVisuals[event.status]

  return (
    <div
      className={cn(
        "min-w-0 rounded-lg border px-3 py-2 text-sm leading-tight shadow-sm",
        visual.eventClassName
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className={cn("size-2.5 shrink-0 rounded-full", visual.dotClassName)} />
        <span className="truncate font-semibold">{event.employee}</span>
      </div>
      <div className="mt-1 truncate text-xs opacity-80">
        {formatEventDateRange(event.start, event.end)} · {visual.label}
      </div>
    </div>
  )
}

function AbsencesListView({
  absences,
  onOpenAbsence,
}: {
  absences: AbsenceEvent[]
  onOpenAbsence: (requestId: number) => void
}) {
  if (!absences.length) {
    return (
      <div className="flex min-h-80 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        No hay ausencias visibles con los filtros actuales.
      </div>
    )
  }

  return (
    <div className="grid gap-2">
      {[...absences]
        .sort((left, right) => left.start.localeCompare(right.start))
        .map((absence) => {
          const visual = statusVisuals[absence.status]

          return (
            <button
              key={absence.id}
              type="button"
              className="grid gap-3 rounded-lg border p-4 text-left transition hover:bg-slate-50 md:grid-cols-[10rem_minmax(0,1fr)_auto]"
              onClick={() => onOpenAbsence(absence.requestId)}
            >
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  {formatDate(absence.start)}
                </p>
                <p className="text-xs text-muted-foreground">
                  hasta {formatDate(absence.end)}
                </p>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {absence.employee}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {absence.type}
                </p>
                {absence.note ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {absence.note}
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-2 md:justify-end">
                <span
                  className={cn("size-2 rounded-full", visual.dotClassName)}
                />
                <span className="text-sm font-medium">{visual.label}</span>
              </div>
            </button>
          )
        })}
    </div>
  )
}
