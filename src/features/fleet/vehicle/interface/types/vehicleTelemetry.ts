export type VehicleTelemetryAlertSeverity = "WARNING" | "CRITICAL" | "INFO"

export type VehicleTelemetryAlert = {
  id?: string | number
  type: string
  severity: VehicleTelemetryAlertSeverity
  title?: string | null
  description?: string | null
  value?: number | string | null
  status?: string | null
  timestamp?: string | null
}

export type VehicleTelemetryCurrentResponse = {
  vehicleId: number
  deviceIdentifier: string
  recordedAt: string
  speed: number | null
  odometer: number | null
  fuelLevel: number | null
  rpm: number | null
  engineTemperature: number | null
  batteryVoltage: number | null
  latitude: number | null
  longitude: number | null
  ignition: boolean | null
  engineHours: number | null
  engineRunning?: boolean | null
  heading?: number | null
  gpsSignal?: number | null
  deviceStatus?: "CONNECTED" | "DISCONNECTED" | null
  source?: string | null
  address?: string | null
  alerts?: VehicleTelemetryAlert[] | null
}
