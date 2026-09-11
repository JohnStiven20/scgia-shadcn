import type { VehicleTelemetryCurrentResponse } from "../../interface/types/vehicleTelemetry"

export type TelemetrySample = {
  recordedAt: string
  shortTime: string
  speed: number
  rpm: number
}

export type SeverityTone = "WARNING" | "CRITICAL" | "INFO"

export type PresentableAlert = {
  id: string
  title: string
  description: string
  severity: SeverityTone
  relativeTime: string
}

export type ConnectionTone = "success" | "warning" | "danger"

export type ConnectionChip = {
  text: string
  tone: ConnectionTone
}

export type GpsLevel = {
  label: string
  bars: number
  iconClassName: string
}

export type VehicleTelemetryViewModel = {
  telemetry: VehicleTelemetryCurrentResponse | null
  connected: boolean
  connecting: boolean
  error: string | null
  lastUpdatedAt: string | null
  now: number
}
