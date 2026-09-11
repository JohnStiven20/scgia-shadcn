import type { Vehicle } from "@/features/interface/vehicle/type/vehicle-base"
import type { Worker } from "@/features/interface/worker/type/worker.inteface"

import type { VehicleSettingsFormState, WorkerOption } from "./types"

export const UNASSIGNED_WORKER_ID = 0

export function getInitialVehicleSettings(
  vehicle: Vehicle
): VehicleSettingsFormState {
  return {
    workerId: vehicle.workerId ?? null,
    available: vehicle.available,
  }
}

export function getWorkerDisplayName(worker: Worker) {
  return [worker.name, worker.surname].filter(Boolean).join(" ").trim()
}

export function buildWorkerOptions(
  workers: Worker[],
  vehicle: Vehicle
): WorkerOption[] {
  const options: WorkerOption[] = [
    { value: UNASSIGNED_WORKER_ID, label: "Sin asignar" },
    ...workers.map((worker) => ({
      value: worker.id,
      label: getWorkerDisplayName(worker) || `Trabajador #${worker.id}`,
    })),
  ]

  if (
    vehicle.workerId &&
    !options.some((option) => option.value === vehicle.workerId)
  ) {
    options.push({
      value: vehicle.workerId,
      label:
        [vehicle.workerName, vehicle.workerSurname]
          .filter(Boolean)
          .join(" ")
          .trim() || `Trabajador #${vehicle.workerId}`,
    })
  }

  return options
}

export function hasVehicleSettingsChanged(
  current: VehicleSettingsFormState,
  initial: VehicleSettingsFormState
) {
  return (
    current.workerId !== initial.workerId ||
    current.available !== initial.available
  )
}

export function getOperationalStatusLabel(available: boolean) {
  return available ? "Disponible para asignacion" : "No disponible"
}
