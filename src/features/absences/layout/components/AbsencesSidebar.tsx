import { CalendarDays, Filter, Star } from "lucide-react"
import { es } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { statusVisuals } from "./absencesPage.constants"
import type { AbsenceEvent, CalendarViewMode } from "./absencesPage.types"
import { formatDate } from "./absencesPage.utils"

type AbsencesSidebarProps = {
  selectedDate: Date
  employees: string[]
  selectedEmployees: string[]
  highlightedDays: AbsenceEvent[]
  viewMode: CalendarViewMode
  onDateChange: (date: Date) => void
  onToggleEmployee: (employee: string) => void
  onSelectAllEmployees: () => void
  onOpenAbsence: (requestId: number) => void
  onViewChange: (viewMode: CalendarViewMode) => void
}

export function AbsencesSidebar({
  selectedDate,
  employees,
  selectedEmployees,
  highlightedDays,
  viewMode,
  onDateChange,
  onToggleEmployee,
  onSelectAllEmployees,
  onOpenAbsence,
  onViewChange,
}: AbsencesSidebarProps) {
  return (
    <aside className="grid gap-4">
      <Card className="border-border/80 py-4 shadow-sm shadow-slate-100/70 [--card-spacing:--spacing(4)]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CalendarDays className="size-5 text-slate-900" />
            <CardTitle>Navegacion rapida</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Calendar
            mode="single"
            selected={selectedDate}
            locale={es}
            className="mx-auto"
            onSelect={(date) => {
              if (date) {
                onDateChange(date)
              }
            }}
          />
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={viewMode === "month" ? "default" : "outline"}
              onClick={() => onViewChange("month")}
            >
              Mes
            </Button>
            <Button
              type="button"
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => onViewChange("list")}
            >
              Lista
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 py-4 shadow-sm shadow-slate-100/70 [--card-spacing:--spacing(4)]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Filter className="size-5 text-slate-900" />
            <CardTitle>Filtros y leyenda</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-950">Empleados</p>
              <Button
                type="button"
                variant="link"
                className="h-auto px-0 text-xs text-muted-foreground"
                onClick={onSelectAllEmployees}
              >
                Todos
              </Button>
            </div>
            {employees.length ? (
              employees.map((employee) => (
                <label
                  key={employee}
                  className="flex items-center gap-3 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(employee)}
                    className="size-4 rounded border-border accent-slate-950"
                    onChange={() => onToggleEmployee(employee)}
                  />
                  <span className="truncate">{employee}</span>
                </label>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Sin empleados.</p>
            )}
          </div>

          <div className="grid gap-3 border-t pt-4">
            <p className="text-sm font-semibold text-slate-950">Estados</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {Object.entries(statusVisuals).map(([status, visual]) => (
                <div key={status} className="flex items-center gap-2 text-sm">
                  <span className={cn("size-2.5 rounded-full", visual.dotClassName)} />
                  <span className="text-muted-foreground">{visual.label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 py-4 shadow-sm shadow-slate-100/70 [--card-spacing:--spacing(4)]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Star className="size-5 text-slate-900" />
            <CardTitle>Dias destacados</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {highlightedDays.length ? (
            <div className="grid gap-2">
              {highlightedDays.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  className="grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-1 py-1.5 text-left transition hover:bg-slate-50"
                  onClick={() => onOpenAbsence(event.requestId)}
                >
                  <span className="text-sm font-semibold text-slate-900">
                    {formatDate(event.start)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {event.employee}
                    </span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {event.type}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "size-2.5 shrink-0 rounded-full",
                      statusVisuals[event.status].dotClassName
                    )}
                  />
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No hay ausencias destacadas en el rango actual.
            </p>
          )}
        </CardContent>
      </Card>
    </aside>
  )
}
