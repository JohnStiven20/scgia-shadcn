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
      <CardHeader className="grid-cols-[1fr_auto] items-center">
        <div className="flex items-center gap-3">
          <Bell className="size-5 text-slate-900" />
          <CardTitle>Eventos del dia</CardTitle>
        </div>
        <span className="text-sm text-muted-foreground">
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
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-950">
                        {presentation.label}
                      </p>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {event.locationName ?? "Torrevieja"}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold">
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
