import type { ConnectionChip, ConnectionTone, GpsLevel } from "./types"
import type { VehicleTelemetryCurrentResponse } from "../../interface/types/vehicleTelemetry"

export function formatNumber(value: number | null | undefined, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-"
  }

  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}

export function metricValue(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 0
  }

  return value
}

export function formatClock(value?: string | null) {
  if (!value) {
    return "--:--:--"
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "--:--:--"
  }

  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date)
}

export function formatRelativeTime(
  value: string | null | undefined,
  now: number
) {
  if (!value) {
    return "sin datos"
  }

  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) {
    return "sin datos"
  }

  const diffSeconds = Math.max(0, Math.floor((now - timestamp) / 1000))
  if (diffSeconds < 60) {
    return `hace ${diffSeconds} s`
  }

  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) {
    return `hace ${diffMinutes} min`
  }

  return `hace ${Math.floor(diffMinutes / 60)} h`
}

export function formatCoordinates(
  latitude?: number | null,
  longitude?: number | null
) {
  if (
    latitude === null ||
    latitude === undefined ||
    longitude === null ||
    longitude === undefined
  ) {
    return "Sin coordenadas"
  }

  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
}

export function clampPercent(value: number, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max)
}

export function getCompassDirection(heading?: number | null) {
  if (heading === null || heading === undefined || Number.isNaN(heading)) {
    return "N"
  }

  const directions = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"]
  const index =
    Math.round((((heading % 360) + 360) % 360) / 45) % directions.length
  return directions[index]
}

export function formatEngineActiveTime(hours?: number | null) {
  if (hours === null || hours === undefined || Number.isNaN(hours)) {
    return "Sin dato"
  }

  const totalSeconds = Math.max(0, Math.round(hours * 3600))
  const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, "0")
  const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0")
  const ss = String(totalSeconds % 60).padStart(2, "0")
  return `${hh}:${mm}:${ss}`
}

export function getGpsLevel(
  signal?: number | null,
  connected?: boolean
): GpsLevel {
  if (signal !== null && signal !== undefined && !Number.isNaN(signal)) {
    if (signal >= 75) {
      return { label: "Excelente", bars: 4, iconClassName: "text-emerald-600" }
    }
    if (signal >= 50) {
      return { label: "Buena", bars: 3, iconClassName: "text-blue-600" }
    }
    if (signal >= 25) {
      return { label: "Media", bars: 2, iconClassName: "text-amber-600" }
    }
    return { label: "Debil", bars: 1, iconClassName: "text-red-600" }
  }

  if (connected) {
    return { label: "Excelente", bars: 4, iconClassName: "text-emerald-600" }
  }

  return { label: "Sin senal", bars: 0, iconClassName: "text-slate-400" }
}

export function getConnectionChip(
  telemetry: VehicleTelemetryCurrentResponse | null,
  connected: boolean,
  connecting: boolean
): ConnectionChip {
  if (telemetry?.deviceStatus === "DISCONNECTED") {
    return { text: "Desconectado", tone: "danger" }
  }

  if (connected) {
    return { text: "En vivo", tone: "success" }
  }

  if (connecting) {
    return { text: "Conectando", tone: "warning" }
  }

  return { text: "Sin enlace", tone: "danger" }
}

export function getMapBadgeTone(connected: boolean): ConnectionTone {
  return connected ? "success" : "warning"
}
