import { Client } from "@stomp/stompjs"
import { useEffect, useMemo, useState } from "react"

import { API_BASE_URL } from "@/api/apiConfig"
import type { VehicleTelemetryCurrentResponse } from "@/features/fleet/vehicle/interface/types/vehicleTelemetry"

type UseVehicleTelemetryResult = {
  telemetry: VehicleTelemetryCurrentResponse | null
  connected: boolean
  connecting: boolean
  error: string | null
  lastUpdatedAt: string | null
}

function resolveTelemetryBrokerUrl() {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL
  }

  const apiUrl = new URL(API_BASE_URL, window.location.origin)
  const wsProtocol = apiUrl.protocol === "https:" ? "wss:" : "ws:"

  return `${wsProtocol}//${apiUrl.host}/ws`
}

export function useVehicleTelemetry(
  vehicleId: number | null
): UseVehicleTelemetryResult {
  const [telemetry, setTelemetry] =
    useState<VehicleTelemetryCurrentResponse | null>(null)
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null)

  const brokerURL = useMemo(() => resolveTelemetryBrokerUrl(), [])

  useEffect(() => {
    if (!vehicleId) {
      setTelemetry(null)
      setConnected(false)
      setConnecting(false)
      setError(null)
      setLastUpdatedAt(null)
      return
    }

    const token =
      localStorage.getItem("token") ?? sessionStorage.getItem("token")

    setTelemetry(null)
    setConnected(false)
    setConnecting(true)
    setError(null)
    setLastUpdatedAt(null)

    const client = new Client({
      brokerURL,
      reconnectDelay: 5000,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      debug: () => undefined,
    })

    client.onConnect = () => {
      setConnected(true)
      setConnecting(false)
      setError(null)

      client.subscribe(`/topic/vehicles/${vehicleId}/telemetry`, (message) => {
        try {
          const nextTelemetry = JSON.parse(
            message.body
          ) as VehicleTelemetryCurrentResponse
          setTelemetry(nextTelemetry)
          setLastUpdatedAt(nextTelemetry.recordedAt)
          setConnected(true)
          setConnecting(false)
          setError(null)
        } catch {
          setError("No se pudo interpretar la telemetria recibida.")
        }
      })
    }

    client.onStompError = (frame) => {
      setConnected(false)
      setConnecting(false)
      setError(
        frame.headers.message ?? "No se pudo establecer la conexion STOMP."
      )
    }

    client.onWebSocketClose = () => {
      setConnected(false)
      setConnecting(Boolean(vehicleId))
    }

    client.onWebSocketError = () => {
      setConnected(false)
      setConnecting(false)
      setError(`La conexion de telemetria no esta disponible en ${brokerURL}.`)
    }

    client.activate()

    return () => {
      setConnected(false)
      setConnecting(false)
      void client.deactivate()
    }
  }, [brokerURL, vehicleId])

  return {
    telemetry,
    connected,
    connecting,
    error,
    lastUpdatedAt,
  }
}
