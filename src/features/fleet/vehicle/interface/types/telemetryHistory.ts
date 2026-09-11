export type TelemetryState = "MOVING" | "STOPPED" | "ENGINE_OFF" | "NO_SIGNAL"

export interface TelemetrySnapshot {
  id: number
  timestamp: string
  latitude?: number | null
  longitude?: number | null
  speed?: number | null
  rpm?: number | null
  odometer?: number | null
  engineRunning?: boolean | null
  fuelLevel?: number | null
  state: TelemetryState
}

export interface TelemetryDaySummary {
  distanceTravelledKm: number
  movingTimeSeconds: number
  stoppedTimeSeconds: number
  stopsCount: number
  averageSpeedKmh: number
  maximumSpeedKmh: number
}

export interface TelemetryEvent {
  id: number
  timestamp: string
  type: "TRIP_STARTED" | "STOPPED" | "MOVING" | "TRIP_ENDED"
  durationSeconds?: number
  locationName?: string
}

export type TelemetryHistoryResponse = {
  date: string
  summary: TelemetryDaySummary
  snapshots: TelemetrySnapshot[]
  events: TelemetryEvent[]
}
