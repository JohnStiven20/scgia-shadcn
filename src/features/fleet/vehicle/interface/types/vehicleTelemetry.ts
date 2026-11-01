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

/** Payload AVL enviado por el dispositivo Fmc0003. */
export interface Fmc0003AvlRecord {
  timestamp: string
  priority: number
  longitude: number
  latitude: number
  altitude: number
  angle: number
  satellites: number
  speed: number
  eventId: number
  ioElements: Record<number, unknown>
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
  externalVoltage?: number | null
  activeGsmOperator?: string | null
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
  timestamp?: string
  priority?: number
  altitude?: number
  angle?: number
  satellites?: number
  eventId?: number
  ioElements?: Record<number, unknown>
}
