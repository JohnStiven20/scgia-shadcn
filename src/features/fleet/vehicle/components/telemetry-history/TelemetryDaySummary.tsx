import {
  Clock,
  Gauge,
  MapPinned,
  PauseCircle,
  Route,
  Timer,
} from "lucide-react"

import type { TelemetryDaySummary as TelemetryDaySummaryData } from "../../interface/types/telemetryHistory"
import { TelemetryMetricCard } from "../telemetry/components"
import { MetricProgress } from "../telemetry/components"
import { formatSecondsAsCompactDuration } from "./telemetryHistoryShared"

type TelemetryDaySummaryProps = {
  summary: TelemetryDaySummaryData
}

export function TelemetryDaySummary({ summary }: TelemetryDaySummaryProps) {
  const totalTime = summary.movingTimeSeconds + summary.stoppedTimeSeconds
  const movingPercent = totalTime
    ? (summary.movingTimeSeconds / totalTime) * 100
    : 0
  const stoppedPercent = totalTime
    ? (summary.stoppedTimeSeconds / totalTime) * 100
    : 0

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
      <TelemetryMetricCard
        title="Distancia"
        value={summary.distanceTravelledKm.toLocaleString("es-ES", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })}
        unit="km"
        icon={Route}
        iconClassName="text-slate-900"
        footer={
          <span className="text-xs text-muted-foreground">
            Ruta urbana Torrevieja
          </span>
        }
      />
      <TelemetryMetricCard
        title="En movimiento"
        value={formatSecondsAsCompactDuration(summary.movingTimeSeconds)}
        icon={Timer}
        iconClassName="text-emerald-600"
        footer={
          <MetricProgress
            value={movingPercent}
            className="bg-emerald-500"
            label={`${Math.round(movingPercent)}% del tiempo`}
          />
        }
      />
      <TelemetryMetricCard
        title="Detenido"
        value={formatSecondsAsCompactDuration(summary.stoppedTimeSeconds)}
        icon={PauseCircle}
        iconClassName="text-amber-600"
        footer={
          <MetricProgress
            value={stoppedPercent}
            className="bg-amber-500"
            label={`${summary.stopsCount} paradas`}
          />
        }
      />
      <TelemetryMetricCard
        title="Paradas"
        value={String(summary.stopsCount)}
        icon={MapPinned}
        iconClassName="text-slate-900"
        footer={
          <span className="text-xs text-muted-foreground">
            Incluye paradas con motor encendido
          </span>
        }
      />
      <TelemetryMetricCard
        title="Velocidad media"
        value={String(summary.averageSpeedKmh)}
        unit="km/h"
        icon={Gauge}
        iconClassName="text-blue-600"
        footer={
          <MetricProgress
            value={(summary.averageSpeedKmh / 120) * 100}
            className="bg-blue-500"
            label="Media sobre tramos activos"
          />
        }
      />
      <TelemetryMetricCard
        title="Velocidad max."
        value={String(summary.maximumSpeedKmh)}
        unit="km/h"
        icon={Clock}
        iconClassName="text-blue-600"
        footer={
          <MetricProgress
            value={(summary.maximumSpeedKmh / 120) * 100}
            className="bg-blue-500"
            label="Pico registrado"
          />
        }
      />
    </div>
  )
}
