import { useMemo, useState } from "react"

import type { Vehicle } from "@/features/interface/vehicle/type/vehicle-base"

import { useTelemetryHistory } from "../hooks/useTelemetryHistory"
import { getMockTelemetryVehicleLabel } from "../services/telemetryHistoryService"
import { TelemetryDayEvents } from "./telemetry-history/TelemetryDayEvents"
import { TelemetryDayRecords } from "./telemetry-history/TelemetryDayRecords"
import { TelemetryDaySummary } from "./telemetry-history/TelemetryDaySummary"
import { TelemetryHistoryEmptyState } from "./telemetry-history/TelemetryHistoryEmptyState"
import { TelemetryHistoryHeader } from "./telemetry-history/TelemetryHistoryHeader"
import { TelemetryHistoryMap } from "./telemetry-history/TelemetryHistoryMap"
import { TelemetryHistorySkeleton } from "./telemetry-history/TelemetryHistorySkeleton"
import { TelemetrySpeedEvolutionChart } from "./telemetry-history/TelemetrySpeedEvolutionChart"

type VehicleTelemetryHistoryTabProps = {
  vehicleId: number
  vehicle: Vehicle
}

export function VehicleTelemetryHistoryTab({
  vehicleId,
  vehicle,
}: VehicleTelemetryHistoryTabProps) {
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const { data, hasDevice, isLoading, requestDate } = useTelemetryHistory(
    vehicle,
    selectedDate
  )
  const hasRecords = Boolean(data?.snapshots.length)
  const formattedEmptyDate = useMemo(() => {
    const date = new Date(`${requestDate}T12:00:00`)

    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }, [requestDate])

  function handleExportTelemetryHistory() {
    void vehicleId
    void requestDate
  }

  return (
    <div className="grid gap-4">
      <TelemetryHistoryHeader
        selectedDate={selectedDate}
        requestDate={requestDate}
        deviceName={getMockTelemetryVehicleLabel(vehicle)}
        onDateChange={setSelectedDate}
        onExport={handleExportTelemetryHistory}
      />

      {!hasDevice ? (
        <TelemetryHistoryEmptyState
          variant="no-device"
          title="Registro de telemetria no disponible"
          description="Este vehiculo no dispone de ningun dispositivo de telemetria asociado."
          details="Asocia un dispositivo compatible para consultar el historico persistido."
        />
      ) : isLoading ? (
        <TelemetryHistorySkeleton />
      ) : !data || !hasRecords ? (
        <TelemetryHistoryEmptyState
          variant="no-records"
          title="Sin registros para esta fecha"
          description={`No hay telemetria registrada el ${formattedEmptyDate}.`}
          details="Prueba con otra fecha. El mock devuelve vacio para el 23/08/2026."
        />
      ) : (
        <>
          <TelemetryDaySummary summary={data.summary} />

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_30rem]">
            <TelemetryHistoryMap snapshots={data.snapshots} />
            <TelemetryDayEvents events={data.events} />
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_30rem]">
            <TelemetrySpeedEvolutionChart
              snapshots={data.snapshots}
              events={data.events}
            />
            <TelemetryDayRecords snapshots={data.snapshots} />
          </div>
        </>
      )}
    </div>
  )
}
