import { useEffect, useMemo, useState } from "react"

import type {
  Fmc0003AvlRecord,
  VehicleTelemetryCurrentResponse,
} from "@/features/fleet/vehicle/interface/types/vehicleTelemetry"

type UseVehicleTelemetryResult = {
  telemetry: VehicleTelemetryCurrentResponse | null
  connected: boolean
  connecting: boolean
  error: string | null
  lastUpdatedAt: string | null
}

function resolveTelemetryBrokerUrl() {
  
  const configuredUrl = import.meta.env.VITE_WS_URL
  const configuredPath = import.meta.env.VITE_WS_PATH || "/ws"

  if (configuredUrl?.includes("://")) {
    const url = new URL(configuredUrl)
    url.protocol = "ws:"
    if (url.pathname === "/") url.pathname = configuredPath
    return url.toString()
  }

  return `ws://${configuredUrl}${configuredPath}`
}

function parseFmc0003AvlRecord(payload: string): Fmc0003AvlRecord | null {
  if (payload.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(payload) as Omit<Fmc0003AvlRecord, "ioElements"> & {
        ioElements?: Record<string, unknown>
      }

      return {
        timestamp: parsed.timestamp,
        priority: Number(parsed.priority),
        longitude: Number(parsed.longitude),
        latitude: Number(parsed.latitude),
        altitude: Number(parsed.altitude),
        angle: Number(parsed.angle),
        satellites: Number(parsed.satellites),
        speed: Number(parsed.speed),
        eventId: Number(parsed.eventId),
        ioElements: (parsed.ioElements ?? {}) as Record<number, unknown>,
      }
    } catch {
      return null
    }
  }

  const content = payload.match(/^Fmc0003AvlRecord\[(.*)\]$/)?.[1]
  if (!content) return null

  const ioElementsMatch = content.match(/ioElements=\{(.*)\}$/)
  const valuesContent = ioElementsMatch
    ? content.slice(0, ioElementsMatch.index).replace(/, $/, "")
    : content

  const values = Object.fromEntries(
    valuesContent.split(", ").map((entry) => {
      const separatorIndex = entry.indexOf("=")
      return [entry.slice(0, separatorIndex), entry.slice(separatorIndex + 1)]
    })
  )

  const ioElements = Object.fromEntries(
    (ioElementsMatch?.[1] ?? "")
      .split(", ")
      .filter(Boolean)
      .map((entry) => {
        const [key, value] = entry.split("=")
        return [Number(key), Number(value)]
      })
  )

  return {
    timestamp: values.timestamp,
    priority: Number(values.priority),
    longitude: Number(values.longitude),
    latitude: Number(values.latitude),
    altitude: Number(values.altitude),
    angle: Number(values.angle),
    satellites: Number(values.satellites),
    speed: Number(values.speed),
    eventId: Number(values.eventId),
    ioElements,
  }
}

function mapTelemetry(record: Fmc0003AvlRecord, vehicleId: number) {
  const ioElements = record.ioElements as Record<string, unknown>
  const numberValue = (key: string) => {
    const value = ioElements[key]
    return value == null ? null : Number(value)
  }

  return {
    vehicleId,
    deviceIdentifier: `Fmc0003-${vehicleId}`,
    recordedAt: record.timestamp,
    speed: record.speed,
    // Teltonika sends the total odometer in metres.
    odometer: numberValue("TOTAL_ODOMETER") === null
      ? null
      : numberValue("TOTAL_ODOMETER")! / 1000,
    // Teltonika sends OEM fuel level in decilitres (L x 10).
    fuelLevel: numberValue("FUEL_LEVEL_1") === null
      ? null
      : numberValue("FUEL_LEVEL_1")! / 10,
    rpm: null,
    engineTemperature: null,
    // Voltage IO values are sent in millivolts.
    batteryVoltage: numberValue("BATTERY_VOLTAGE") === null
      ? null
      : numberValue("BATTERY_VOLTAGE")! / 1000,
    externalVoltage: numberValue("EXTERNAL_VOLTAGE") === null
      ? null
      : numberValue("EXTERNAL_VOLTAGE")! / 1000,
    activeGsmOperator:
      numberValue("ACTIVE_GSM_OPERATOR") === null
        ? null
        : String(numberValue("ACTIVE_GSM_OPERATOR")),
    latitude: record.latitude,
    longitude: record.longitude,
    ignition: Boolean(numberValue("IGNITION")),
    engineHours: null,
    heading: record.angle,
    gpsSignal: numberValue("GSM_SIGNAL"),
    deviceStatus: "CONNECTED" as const,
    source: "Fmc0003",
    eventId: record.eventId,
    altitude: record.altitude,
    priority: record.priority,
    ioElements: record.ioElements,
  } satisfies VehicleTelemetryCurrentResponse
}

export function useVehicleTelemetry(
  vehicleId: number | null
): UseVehicleTelemetryResult {
  const [telemetry, setTelemetry] = useState<VehicleTelemetryCurrentResponse | null>(null)
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null)
  const brokerURL = useMemo(() => resolveTelemetryBrokerUrl(), [])

  useEffect(() => {
    if (!vehicleId) return

    setConnected(false)
    setConnecting(true)
    setError(null)

    let stopped = false
    let retryTimer: number | undefined
    let socket: WebSocket | null = null
    let attempt = 0

    const scheduleReconnect = () => {
      if (stopped || retryTimer !== undefined) return

      const delay = Math.min(30_000, 1_000 * 2 ** attempt)
      attempt += 1
      setConnected(false)
      setConnecting(true)
      retryTimer = window.setTimeout(() => {
        retryTimer = undefined
        connect()
      }, delay)
    }

    const connect = () => {
      if (stopped) return

      setConnecting(true)
      socket = new WebSocket(brokerURL)

      socket.onopen = () => {
        attempt = 0
        socket?.send(JSON.stringify({ vehicleIds: [vehicleId] }))
        setConnected(true)
        setConnecting(false)
        setError(null)
      }

    socket.onmessage = (event) => {
      const record = parseFmc0003AvlRecord(String(event.data))
      if (!record) return

      const nextTelemetry = mapTelemetry(record, vehicleId)
      setTelemetry(nextTelemetry)
      setLastUpdatedAt(nextTelemetry.recordedAt)
      setConnected(true)
      setError(null)
    }

    socket.onerror = () => {
      setConnected(false)
      setConnecting(false)
      setError(`La conexión de telemetría no está disponible en ${brokerURL}.`)
    }

      socket.onclose = () => {
        socket = null
        setConnected(false)
        scheduleReconnect()
      }
    }

    connect()

    return () => {
      stopped = true
      if (retryTimer !== undefined) window.clearTimeout(retryTimer)
      socket?.close()
    }
  }, [brokerURL, vehicleId])

  return { telemetry, connected, connecting, error, lastUpdatedAt }
}
