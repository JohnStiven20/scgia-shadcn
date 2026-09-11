import type {
  VehicleTelemetryAlert,
  VehicleTelemetryCurrentResponse,
} from "../../interface/types/vehicleTelemetry"
import { MAX_POINTS } from "./constants"
import type { PresentableAlert, TelemetrySample } from "./types"
import { formatNumber, formatRelativeTime, metricValue } from "./utils"

export function formatAlertTitle(alert: VehicleTelemetryAlert) {
  if (alert.title) {
    return alert.title
  }

  const titles: Record<string, string> = {
    HIGH_ENGINE_TEMPERATURE: "Temperatura de motor alta",
    LOW_FUEL: "Nivel de combustible bajo",
    HARSH_ACCELERATION: "Aceleracion brusca detectada",
  }

  return (
    titles[alert.type] ??
    alert.type
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/^\w/, (char) => char.toUpperCase())
  )
}

export function formatAlertDescription(alert: VehicleTelemetryAlert) {
  if (alert.description) {
    return alert.description
  }

  if (typeof alert.value === "number") {
    if (alert.type.includes("TEMPERATURE")) {
      return `${formatNumber(alert.value)} C`
    }
    if (alert.type.includes("FUEL")) {
      return `${formatNumber(alert.value)}%`
    }
  }

  if (typeof alert.value === "string") {
    return alert.value
  }

  return alert.severity === "INFO" ? "Severidad: Media" : "Activa"
}

export function deriveAlerts(
  telemetry: VehicleTelemetryCurrentResponse | null,
  now: number
): PresentableAlert[] {
  if (!telemetry) {
    return []
  }

  if (telemetry.alerts?.length) {
    return telemetry.alerts.slice(0, 3).map((alert, index) => ({
      id: String(alert.id ?? `${alert.type}-${index}`),
      title: formatAlertTitle(alert),
      description: formatAlertDescription(alert),
      severity: alert.severity,
      relativeTime: formatRelativeTime(
        alert.timestamp ?? telemetry.recordedAt,
        now
      ),
    }))
  }

  const fallback: PresentableAlert[] = []

  if ((telemetry.engineTemperature ?? 0) > 105) {
    fallback.push({
      id: "high-engine-temperature",
      title: "Temperatura de motor alta",
      description: `${formatNumber(telemetry.engineTemperature)} C`,
      severity: "WARNING",
      relativeTime: formatRelativeTime(telemetry.recordedAt, now),
    })
  }

  if ((telemetry.fuelLevel ?? 100) < 15) {
    fallback.push({
      id: "low-fuel",
      title: "Nivel de combustible bajo",
      description: `${formatNumber(telemetry.fuelLevel)}%`,
      severity: "WARNING",
      relativeTime: formatRelativeTime(telemetry.recordedAt, now),
    })
  }

  if ((telemetry.speed ?? 0) > 95) {
    fallback.push({
      id: "speed-peak",
      title: "Aceleracion brusca detectada",
      description: `${formatNumber(telemetry.speed)} km/h`,
      severity: "INFO",
      relativeTime: formatRelativeTime(telemetry.recordedAt, now),
    })
  }

  return fallback.slice(0, 3)
}

export function buildSample(
  telemetry: VehicleTelemetryCurrentResponse
): TelemetrySample {
  const timestamp = new Date(telemetry.recordedAt).getTime()
  return {
    recordedAt: telemetry.recordedAt,
    shortTime: Number.isNaN(timestamp)
      ? "--:--"
      : new Intl.DateTimeFormat("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(timestamp),
    speed: metricValue(telemetry.speed),
    rpm: metricValue(telemetry.rpm),
  }
}

export function historyReducer(
  current: TelemetrySample[],
  telemetry: VehicleTelemetryCurrentResponse
) {
  const next = buildSample(telemetry)
  if (current[current.length - 1]?.recordedAt === next.recordedAt) {
    return current
  }

  return [...current, next].slice(-MAX_POINTS)
}
