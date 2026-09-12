import { format } from "date-fns"
import { Bell } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import type { TelemetryEvent } from "../../interface/types/telemetryHistory"
import {
  formatSecondsAsCompactDuration,
  getTelemetryEventPresentation,
} from "./telemetryHistoryShared"

type TelemetryDayEventsProps = {
  events: TelemetryEvent[]
}

export function TelemetryDayEvents({ events }: TelemetryDayEventsProps) {
  return (
    <Card className="border-border/80 py-4 shadow-sm shadow-slate-100/70 [--card-spacing:--spacing(4)]">
      <CardHeader className="gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <Bell className="size-5 text-slate-900" />
          <CardTitle>Eventos del dia</CardTitle>
        </div>
        <span className="text-sm text-muted-foreground sm:justify-self-end">
          {events.length} eventos
        </span>
      </CardHeader>
      <CardContent>
        <div className="relative grid gap-4 before:absolute before:top-3 before:bottom-3 before:left-4 before:w-px before:bg-border">
          {events.map((event) => {
            const presentation = getTelemetryEventPresentation(event)

            return (
              <div key={event.id} className="relative flex gap-3">
                <span
                  className="z-10 grid size-8 shrink-0 place-items-center rounded-full text-white shadow-sm"
                  style={{ backgroundColor: presentation.color }}
                >
                  <presentation.Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1 rounded-lg border bg-card p-3">
                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-950">
                        {presentation.label}
                      </p>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {event.locationName ?? "Torrevieja"}
                      </p>
                    </div>
                    <span className="text-sm font-semibold sm:shrink-0">
                      {format(new Date(event.timestamp), "HH:mm")}
                    </span>
                  </div>
                  {event.durationSeconds ? (
                    <Badge variant="secondary" className="mt-3">
                      {formatSecondsAsCompactDuration(event.durationSeconds)}
                    </Badge>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
