import { CalendarDays, Download, Route } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import { LiveBadge } from "../telemetry/components"

type TelemetryHistoryHeaderProps = {
  selectedDate: Date
  requestDate: string
  deviceName: string
  onDateChange: (date: Date) => void
  onExport: () => void
}

export function TelemetryHistoryHeader({
  selectedDate,
  requestDate,
  deviceName,
  onDateChange,
  onExport,
}: TelemetryHistoryHeaderProps) {
  return (
    <Card className="border-border/80 py-4 shadow-sm shadow-slate-100/70 [--card-spacing:--spacing(4)]">
      <CardHeader className="gap-4">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="flex min-w-0 gap-3 sm:items-center">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl border bg-slate-50 text-slate-900 sm:size-12">
              <Route className="size-6" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-xl leading-tight font-semibold tracking-normal text-slate-950 sm:text-2xl">
                Registro de telemetria
              </CardTitle>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <LiveBadge label="Historico" tone="success" />
                <CardDescription className="text-sm">
                  Datos mock del dia seleccionado en Torrevieja
                </CardDescription>
              </div>
            </div>
          </div>
          <div className="grid min-w-0 gap-3 rounded-md border bg-muted/25 p-3 sm:grid-cols-[minmax(0,1fr)_auto] md:w-[min(32rem,48vw)]">
            <div className="flex min-w-0 items-center gap-3">
              <CalendarDays className="size-5 shrink-0 text-slate-900" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">
                  {deviceName}
                </p>
                <p className="text-xs text-muted-foreground">Dispositivo</p>
              </div>
            </div>
            <div className="flex min-w-0 flex-wrap gap-2 sm:justify-end">
              <Input
                type="date"
                value={requestDate}
                max={formatDateInputValue(new Date())}
                className="h-9 min-w-0 flex-1 sm:w-40 sm:flex-none"
                onChange={(event) => {
                  if (event.target.value) {
                    onDateChange(new Date(`${event.target.value}T12:00:00`))
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={onExport}>
                <Download />
                Exportar
              </Button>
            </div>
            <span className="sr-only">
              Fecha seleccionada {formatDateInputValue(selectedDate)}
            </span>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}

function formatDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}
