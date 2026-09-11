import { useMemo } from "react"

import type { Vehicle } from "@/features/interface/vehicle/type/vehicle-base"

import type { TelemetryHistoryResponse } from "../interface/types/telemetryHistory"
import {
  buildVehicleTelemetryHistory,
  getTelemetryHistoryRequestDate,
} from "../services/telemetryHistoryService"

type UseTelemetryHistoryResult = {
  data: TelemetryHistoryResponse | null
  hasDevice: boolean
  isLoading: boolean
  requestDate: string
}

export function useTelemetryHistory(
  vehicle: Vehicle,
  selectedDate: Date
): UseTelemetryHistoryResult {
  const requestDate = useMemo(
    () => getTelemetryHistoryRequestDate(selectedDate),
    [selectedDate]
  )
  const hasDevice = true

  const data = useMemo(() => {
    return buildVehicleTelemetryHistory(vehicle.id, requestDate)
  }, [requestDate, vehicle.id])

  return {
    data,
    hasDevice,
    isLoading: false,
    requestDate,
  }
}
