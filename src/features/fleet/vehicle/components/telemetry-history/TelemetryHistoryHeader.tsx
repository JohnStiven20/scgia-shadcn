import { CalendarDays, Download, Route } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
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
      <CardHeader className="gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex min-w-0 items-center gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-xl border bg-slate-50 text-slate-900">
            <Route className="size-6" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-2xl font-semibold tracking-normal text-slate-950">
                Registro de telemetria
              </CardTitle>
              <LiveBadge label="Historico" tone="success" />
              <CardDescription className="text-sm">
                Datos mock del dia seleccionado en Torrevieja
              </CardDescription>
            </div>
          </div>
        </div>
        <CardAction className="static row-auto flex flex-wrap items-center gap-2 self-auto justify-self-start lg:justify-self-end">
          <CardContent className="border-l-0 p-0 sm:border-l sm:pl-6">
            <div className="flex min-w-0 items-center gap-3">
              <CalendarDays className="size-5 shrink-0 text-slate-900" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">
                  {deviceName}
                </p>
                <p className="text-xs text-muted-foreground">Dispositivo</p>
              </div>
            </div>
          </CardContent>
          <Input
            type="date"
            value={requestDate}
            max={formatDateInputValue(new Date())}
            className="h-9 w-40"
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
          <span className="sr-only">
            Fecha seleccionada {formatDateInputValue(selectedDate)}
          </span>
        </CardAction>
      </CardHeader>
    </Card>
  )
}

function formatDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}
