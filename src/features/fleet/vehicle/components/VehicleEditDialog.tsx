import type { FormEvent, ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"

import { DatePicker } from "@/components/general/date-picker"
import { OptionsSelect } from "@/components/general/options-select"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useSearchVehicleModelsQuery } from "@/features/fleet/api/apiVehicleModel"
import type { VehicleStatus } from "@/features/interface/vehicle/enum/vehicle-status"
import type { UpdateVehicleRequest } from "@/features/interface/vehicle/request/update-vehicle-request"
import type { Vehicle } from "@/features/interface/vehicle/type/vehicle-base"

type VehicleEditDialogProps = {
  open: boolean
  vehicle: Vehicle
  loading?: boolean
  onClose: () => void
  onSubmit: (request: UpdateVehicleRequest) => Promise<void> | void
}

type VehicleEditForm = {
  internalCode: string
  licensePlate: string
  vin: string
  initialOdometer: string
  currentOdometer: string
  firstRegistrationDate: string
  modelId: string
  warehouseId: string
  status: VehicleStatus
  available: boolean
  color: string
  notes: string
}

const statusOptions: Array<{ value: VehicleStatus; label: string }> = [
  { value: "AVAILABLE", label: "Disponible" },
  { value: "ASSIGNED", label: "Asignado" },
  { value: "IN_MAINTENANCE", label: "En mantenimiento" },
  { value: "OUT_OF_SERVICE", label: "Fuera de servicio" },
]

export function VehicleEditDialog({
  open,
  vehicle,
  loading = false,
  onClose,
  onSubmit,
}: VehicleEditDialogProps) {
  const [form, setForm] = useState<VehicleEditForm>(() => createForm(vehicle))
  const { data: vehicleModelsPage, isFetching: loadingModels } =
    useSearchVehicleModelsQuery({
      page: 0,
      size: 50,
      sort: ["name,asc"],
    })
  const vehicleModels = vehicleModelsPage?.content ?? []
  const modelOptions = useMemo(() => {
    const options = vehicleModels.map((model) => ({
      label: model.name,
      value: String(model.id),
    }))

    if (options.some((option) => option.value === String(vehicle.modelId))) {
      return options
    }

    return [
      { label: vehicle.modelName, value: String(vehicle.modelId) },
      ...options,
    ]
  }, [vehicle.modelId, vehicle.modelName, vehicleModels])

  useEffect(() => {
    if (open) {
      setForm(createForm(vehicle))
    }
  }, [open, vehicle])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await onSubmit({
      internalCode: form.internalCode.trim(),
      licensePlate: form.licensePlate.trim(),
      vin: form.vin.trim(),
      initialOdometer: parseOptionalNumber(form.initialOdometer),
      firstRegistrationDate: form.firstRegistrationDate || null,
      status: form.status,
      available: form.available,
      currentOdometer: parseOptionalNumber(form.currentOdometer),
      color: form.color.trim() || null,
      notes: form.notes.trim() || null,
      modelId: Number(form.modelId),
      workerId: vehicle.workerId ?? null,
      warehouseId: parseOptionalNumber(form.warehouseId),
    })
  }

  function updateField<TField extends keyof VehicleEditForm>(
    field: TField,
    value: VehicleEditForm[TField]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !loading) {
          onClose()
        }
      }}
    >
      <DialogContent showCloseButton={!loading} className="max-w-5xl p-0">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b px-6 py-5 pr-14">
            <DialogTitle className="text-base font-semibold">
              Edición del vehículo
            </DialogTitle>
            <DialogDescription>
              Actualiza los datos operativos y administrativos del vehículo.
            </DialogDescription>
          </DialogHeader>

          <div className="grid max-h-[calc(100svh-13rem)] gap-x-4 gap-y-5 overflow-y-auto px-6 py-5 sm:grid-cols-2">
            <VehicleField
              label="Código interno"
              helper="Identificador interno único utilizado para reconocer el vehículo dentro del sistema."
            >
              <Input
                value={form.internalCode}
                disabled={loading}
                onChange={(event) =>
                  updateField("internalCode", event.target.value)
                }
                required
              />
            </VehicleField>

            <VehicleField
              label="Matrícula"
              helper="Matrícula oficial asignada al vehículo."
            >
              <Input
                value={form.licensePlate}
                disabled={loading}
                onChange={(event) =>
                  updateField("licensePlate", event.target.value)
                }
                required
              />
            </VehicleField>

            <VehicleField
              label="VIN"
              helper="Número de bastidor que identifica de forma única al vehículo."
            >
              <Input
                value={form.vin}
                disabled={loading}
                onChange={(event) => updateField("vin", event.target.value)}
                required
              />
            </VehicleField>

            <VehicleField
              label="Kilometraje inicial"
              helper="Kilometraje que tenía el vehículo al registrarlo en el sistema."
            >
              <Input
                type="number"
                min="0"
                placeholder="Ej. 52340"
                value={form.initialOdometer}
                disabled={loading}
                onChange={(event) =>
                  updateField("initialOdometer", event.target.value)
                }
              />
            </VehicleField>

            <VehicleField label="Kilometraje" helper="Opcional">
              <Input
                type="number"
                min="0"
                value={form.currentOdometer}
                disabled={loading}
                onChange={(event) =>
                  updateField("currentOdometer", event.target.value)
                }
              />
            </VehicleField>

            <VehicleField helper="Fecha en la que el vehículo fue matriculado por primera vez.">
              <DatePicker
                id="vehicle-edit-first-registration-date"
                label="Fecha de primera matriculación"
                value={parseDateValue(form.firstRegistrationDate)}
                onChange={(date) =>
                  updateField("firstRegistrationDate", formatDateValue(date))
                }
                placeholder="Selecciona una fecha"
              />
            </VehicleField>

            <VehicleField helper="Selecciona el modelo correspondiente al vehículo.">
              <OptionsSelect
                id="vehicle-edit-model"
                label="Modelo del vehículo"
                options={modelOptions}
                value={form.modelId}
                onChange={(value) => updateField("modelId", value)}
                placeholder={
                  loadingModels ? "Cargando modelos..." : "Selecciona un modelo"
                }
              />
            </VehicleField>

            <VehicleField
              label="Almacén"
              helper="Ubicación o almacén actual del vehículo. Campo opcional."
            >
              <Input
                type="number"
                min="1"
                placeholder={
                  vehicle.warehouseName
                    ? `${vehicle.warehouseName} (${vehicle.warehouseId ?? ""})`
                    : "ID del almacén"
                }
                value={form.warehouseId}
                disabled={loading}
                onChange={(event) =>
                  updateField("warehouseId", event.target.value)
                }
              />
            </VehicleField>

            <VehicleField label="Estado" helper="Estado operativo actual.">
              <select
                className="h-7 w-full rounded-md border border-input bg-input/20 px-2 text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50"
                value={form.status}
                disabled={loading}
                onChange={(event) =>
                  updateField("status", event.target.value as VehicleStatus)
                }
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </VehicleField>

            <VehicleField
              label="Color del vehículo"
              helper="Indica el color exterior principal del vehículo."
            >
              <Input
                placeholder="Ej. Blanco"
                value={form.color}
                disabled={loading}
                onChange={(event) => updateField("color", event.target.value)}
              />
            </VehicleField>

            <label className="flex items-center gap-2 rounded-md border bg-input/10 px-3 py-2 text-xs font-medium sm:col-span-2">
              <input
                type="checkbox"
                className="size-4 rounded border-input"
                checked={form.available}
                disabled={loading}
                onChange={(event) =>
                  updateField("available", event.target.checked)
                }
              />
              Disponible para operación
            </label>

            <VehicleField
              label="Observaciones"
              helper="Campo opcional para observaciones generales o información relevante."
              className="sm:col-span-2"
            >
              <Textarea
                value={form.notes}
                disabled={loading}
                onChange={(event) => updateField("notes", event.target.value)}
                placeholder="Añade información adicional sobre el vehículo"
              />
            </VehicleField>
          </div>

          <DialogFooter className="border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function VehicleField({
  label,
  helper,
  className,
  children,
}: {
  label?: string
  helper?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={className}>
      {label ? <Label className="mb-1.5">{label}</Label> : null}
      {children}
      {helper ? (
        <p className="mt-1 text-[0.7rem] leading-4 text-muted-foreground">
          {helper}
        </p>
      ) : null}
    </div>
  )
}

function createForm(vehicle: Vehicle): VehicleEditForm {
  return {
    internalCode: vehicle.internalCode,
    licensePlate: vehicle.licensePlate,
    vin: vehicle.vin,
    initialOdometer: formatOptionalNumber(vehicle.initialOdometer),
    currentOdometer: formatOptionalNumber(vehicle.currentOdometer),
    firstRegistrationDate: vehicle.firstRegistrationDate ?? "",
    modelId: String(vehicle.modelId),
    warehouseId: formatOptionalNumber(vehicle.warehouseId),
    status: vehicle.status,
    available: vehicle.available,
    color: vehicle.color ?? "",
    notes: vehicle.notes ?? "",
  }
}

function formatOptionalNumber(value?: number | null) {
  return value == null ? "" : String(value)
}

function parseOptionalNumber(value: string) {
  return value.trim() ? Number(value) : null
}

function parseDateValue(value: string) {
  return value ? new Date(`${value}T00:00:00`) : undefined
}

function formatDateValue(date: Date) {
  return date.toISOString().slice(0, 10)
}
