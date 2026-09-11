import { useEffect, useMemo, useState } from "react"

import { OptionsSelect } from "@/components/general/options-select"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useSearchWorkersQuery } from "@/features/employees/api/employeesApi"
import { useUpdateVehicleSettingsMutation } from "@/features/fleet/api/apiVehicle"
import type { Vehicle } from "@/features/interface/vehicle/type/vehicle-base"

import {
  ReadOnlyValue,
  SettingsPanel,
  SettingsRow,
  SettingsStatus,
} from "./components"
import type { VehicleSettingsFormState } from "./types"
import {
  buildWorkerOptions,
  getInitialVehicleSettings,
  hasVehicleSettingsChanged,
  UNASSIGNED_WORKER_ID,
} from "./utils"

type VehicleSettingsSectionProps = {
  vehicle: Vehicle
}

export function VehicleSettingsSection({
  vehicle,
}: VehicleSettingsSectionProps) {
  const initialSettings = useMemo(
    () => getInitialVehicleSettings(vehicle),
    [vehicle]
  )
  const [formState, setFormState] =
    useState<VehicleSettingsFormState>(initialSettings)
  const [error, setError] = useState<string | null>(null)
  const { data: workersResponse } = useSearchWorkersQuery({
    page: 0,
    size: 50,
    active: true,
  })
  const [updateVehicleSettings, { isLoading }] =
    useUpdateVehicleSettingsMutation()
  const workerOptions = useMemo(
    () => buildWorkerOptions(workersResponse?.content ?? [], vehicle),
    [vehicle, workersResponse?.content]
  )
  const hasChanges = hasVehicleSettingsChanged(formState, initialSettings)

  useEffect(() => {
    setFormState(initialSettings)
  }, [initialSettings])

  async function handleSave() {
    try {
      setError(null)
      await updateVehicleSettings({
        id: vehicle.id,
        request: {
          workerId: formState.workerId,
          available: formState.available,
        },
      }).unwrap()
    } catch {
      setError("No se pudo guardar la configuracion del vehiculo.")
    }
  }

  return (
    <section className="grid gap-6" aria-label="Configuracion del vehiculo">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-normal text-neutral-950">
            Configuracion del vehiculo
          </h2>
          <p className="mt-1 text-lg text-neutral-500">
            Gestiona disponibilidad y asignacion del vehiculo.
          </p>
        </div>
        <SettingsStatus available={formState.available} />
      </div>

      <SettingsPanel>
        <SettingsRow
          title="Responsable"
          description="Trabajador asignado al vehiculo."
        >
          <OptionsSelect
            id="vehicle-worker"
            value={formState.workerId ?? UNASSIGNED_WORKER_ID}
            options={workerOptions}
            onChange={(workerId) => {
              setFormState((current) => ({
                ...current,
                workerId:
                  workerId === UNASSIGNED_WORKER_ID ? null : Number(workerId),
              }))
            }}
          />
        </SettingsRow>

        <SettingsRow
          title="Disponibilidad"
          description="Puede usarse en servicio."
        >
          <div className="flex items-center gap-3">
            <Switch
              checked={formState.available}
              onCheckedChange={(available) => {
                setFormState((current) => ({ ...current, available }))
              }}
            />
            <span className="text-sm font-medium text-neutral-950">
              Vehiculo disponible
            </span>
          </div>
        </SettingsRow>

        <SettingsRow
          title="Dispositivo"
          description="Identificador telemetrico."
        >
          <ReadOnlyValue>
            {vehicle.telemetryDeviceIdentifier || "Sin vincular"}
          </ReadOnlyValue>
        </SettingsRow>
      </SettingsPanel>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={isLoading || !hasChanges}
          onClick={() => {
            setError(null)
            setFormState(initialSettings)
          }}
        >
          Restablecer
        </Button>
        <Button
          type="button"
          size="lg"
          disabled={isLoading || !hasChanges}
          onClick={handleSave}
          className="bg-neutral-950 text-white hover:bg-neutral-800"
        >
          {isLoading ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </section>
  )
}
