import {
  CirclePause,
  CirclePlay,
  Octagon,
  Power,
  RadioTower,
  type LucideIcon,
} from "lucide-react"

import type {
  TelemetryEvent,
  TelemetryState,
} from "../../interface/types/telemetryHistory"

export const telemetryStateLabels: Record<TelemetryState, string> = {
  MOVING: "En movimiento",
  STOPPED: "Detenido",
  ENGINE_OFF: "Apagado",
  NO_SIGNAL: "Sin senal",
}

export const telemetryStateColors: Record<TelemetryState, string> = {
  MOVING: "#16a34a",
  STOPPED: "#f59e0b",
  ENGINE_OFF: "#ef4444",
  NO_SIGNAL: "#64748b",
}

export function formatSecondsAsCompactDuration(totalSeconds: number) {
  const minutes = Math.round(totalSeconds / 60)

  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  return remainingMinutes ? `${hours} h ${remainingMinutes} m` : `${hours} h`
}

export function getTelemetryEventPresentation(event: TelemetryEvent): {
  label: string
  color: string
  Icon: LucideIcon
} {
  const presentation = {
    TRIP_STARTED: {
      label: "Inicio del viaje",
      color: "#16a34a",
      Icon: CirclePlay,
    },
    STOPPED: {
      label: "Parada",
      color: "#f59e0b",
      Icon: CirclePause,
    },
    MOVING: {
      label: "Reanudacion",
      color: "#2563eb",
      Icon: RadioTower,
    },
    TRIP_ENDED: {
      label: "Fin del viaje",
      color: "#ef4444",
      Icon: Octagon,
    },
  } satisfies Record<
    TelemetryEvent["type"],
    { label: string; color: string; Icon: LucideIcon }
  >

  return presentation[event.type]
}

export function getStateIcon(state: TelemetryState) {
  return state === "ENGINE_OFF" ? Power : RadioTower
}
