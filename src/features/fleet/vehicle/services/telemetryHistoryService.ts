import { format, set } from "date-fns"

import type { Vehicle } from "@/features/interface/vehicle/type/vehicle-base"

import { MOCK_TORREVIEJA_ROUTE } from "../page/mockTorreviejaRoute"
import type {
  TelemetryDaySummary,
  TelemetryEvent,
  TelemetryHistoryResponse,
  TelemetrySnapshot,
  TelemetryState,
} from "../interface/types/telemetryHistory"

export function vehicleHasTelemetryDevice(
  vehicle: { telemetryDeviceIdentifier?: string | null } | null | undefined
) {
  return Boolean(vehicle?.telemetryDeviceIdentifier)
}

export function getTelemetryHistoryRequestDate(date: Date) {
  return format(date, "yyyy-MM-dd")
}

export async function getVehicleTelemetryHistory(
  vehicleId: number,
  date: string
): Promise<TelemetryHistoryResponse> {
  return buildVehicleTelemetryHistory(vehicleId, date)
}

export function buildVehicleTelemetryHistory(
  vehicleId: number,
  date: string
): TelemetryHistoryResponse {
  void vehicleId

  const selectedDate = new Date(`${date}T12:00:00`)

  if (date === "2026-08-23") {
    return {
      date,
      summary: deriveSummary([]),
      snapshots: [],
      events: [],
    }
  }

  const snapshots = buildMockSnapshots(selectedDate)

  return {
    date,
    summary: deriveSummary(snapshots),
    snapshots,
    events: deriveEvents(snapshots),
  }
}

function buildSnapshot(
  date: Date,
  config: {
    id: number
    hours: number
    minutes: number
    latitude: number
    longitude: number
    speed: number
    rpm: number
    odometer: number
    fuelLevel: number
    state: TelemetryState
  }
): TelemetrySnapshot {
  return {
    id: config.id,
    timestamp: set(date, {
      hours: config.hours,
      minutes: config.minutes,
      seconds: 0,
      milliseconds: 0,
    }).toISOString(),
    latitude: config.latitude,
    longitude: config.longitude,
    speed: config.speed,
    rpm: config.rpm,
    odometer: config.odometer,
    engineRunning: config.state !== "ENGINE_OFF",
    fuelLevel: config.fuelLevel,
    state: config.state,
  }
}

function buildMockSnapshots(date: Date): TelemetrySnapshot[] {
  const timeline = [
    [8, 15, 0, 0, 64, "STOPPED"],
    [8, 24, 38, 1450, 64, "MOVING"],
    [8, 32, 52, 1850, 63, "MOVING"],
    [8, 43, 66, 2250, 62, "MOVING"],
    [8, 58, 0, 850, 61, "STOPPED"],
    [9, 18, 44, 1700, 61, "MOVING"],
    [9, 35, 73, 2450, 60, "MOVING"],
    [9, 51, 58, 2100, 59, "MOVING"],
    [10, 5, 0, 0, 59, "ENGINE_OFF"],
    [10, 42, 41, 1550, 58, "MOVING"],
    [11, 4, 63, 2200, 57, "MOVING"],
    [11, 27, 0, 900, 56, "STOPPED"],
    [11, 52, 48, 1750, 56, "MOVING"],
    [12, 18, 72, 2480, 55, "MOVING"],
    [12, 41, 54, 1980, 54, "MOVING"],
    [13, 5, 0, 0, 54, "ENGINE_OFF"],
  ] as const
  const routeSamples = sampleRoutePoints(MOCK_TORREVIEJA_ROUTE, timeline.length)

  return timeline.map((point, index) => {
    const [longitude, latitude] = routeSamples[index]

    return buildSnapshot(date, {
      id: index + 1,
      hours: point[0],
      minutes: point[1],
      latitude,
      longitude,
      speed: point[2],
      rpm: point[3],
      odometer: 68420000 + index * 8150,
      fuelLevel: point[4],
      state: point[5],
    })
  })
}

function sampleRoutePoints(route: [number, number][], count: number) {
  return Array.from({ length: count }, (_, index) => {
    const routeIndex = Math.round(
      (index / Math.max(1, count - 1)) * (route.length - 1)
    )

    return route[routeIndex]
  })
}

function deriveSummary(snapshots: TelemetrySnapshot[]): TelemetryDaySummary {
  if (!snapshots.length) {
    return {
      distanceTravelledKm: 0,
      movingTimeSeconds: 0,
      stoppedTimeSeconds: 0,
      stopsCount: 0,
      averageSpeedKmh: 0,
      maximumSpeedKmh: 0,
    }
  }

  let movingTimeSeconds = 0
  let stoppedTimeSeconds = 0
  let stopsCount = 0

  snapshots.forEach((snapshot, index) => {
    const next = snapshots[index + 1]
    const secondsToNext = next
      ? Math.max(
          0,
          Math.round(
            (new Date(next.timestamp).getTime() -
              new Date(snapshot.timestamp).getTime()) /
              1000
          )
        )
      : 0

    if (snapshot.state === "MOVING") {
      movingTimeSeconds += secondsToNext
    }

    if (snapshot.state === "STOPPED" || snapshot.state === "ENGINE_OFF") {
      stoppedTimeSeconds += secondsToNext
      if (snapshot.state === "STOPPED") {
        stopsCount += 1
      }
    }
  })

  const firstOdometer = snapshots[0]?.odometer ?? 0
  const lastOdometer = snapshots[snapshots.length - 1]?.odometer ?? firstOdometer
  const movingSpeeds = snapshots
    .map((snapshot) => snapshot.speed ?? 0)
    .filter((speed) => speed > 0)

  return {
    distanceTravelledKm: Number(((lastOdometer - firstOdometer) / 1000).toFixed(1)),
    movingTimeSeconds,
    stoppedTimeSeconds,
    stopsCount,
    averageSpeedKmh: Math.round(
      movingSpeeds.reduce((total, speed) => total + speed, 0) /
        Math.max(1, movingSpeeds.length)
    ),
    maximumSpeedKmh: Math.max(0, ...movingSpeeds),
  }
}

function deriveEvents(snapshots: TelemetrySnapshot[]): TelemetryEvent[] {
  if (!snapshots.length) {
    return []
  }

  return [
    {
      id: 1,
      timestamp: snapshots[0].timestamp,
      type: "TRIP_STARTED",
      locationName: "Puerto deportivo de Torrevieja",
    },
    {
      id: 2,
      timestamp: snapshots[4].timestamp,
      type: "STOPPED",
      durationSeconds: 20 * 60,
      locationName: "Lagunas de Torrevieja",
    },
    {
      id: 3,
      timestamp: snapshots[5].timestamp,
      type: "MOVING",
      locationName: "CV-95, Torrevieja",
    },
    {
      id: 4,
      timestamp: snapshots[11].timestamp,
      type: "STOPPED",
      durationSeconds: 25 * 60,
      locationName: "Los Balcones",
    },
    {
      id: 5,
      timestamp: snapshots[snapshots.length - 1].timestamp,
      type: "TRIP_ENDED",
      locationName: "Playa del Cura, Torrevieja",
    },
  ]
}

export function getMockTelemetryVehicleLabel(vehicle: Vehicle) {
  return vehicle.telemetryDeviceIdentifier ?? vehicle.internalCode
}
